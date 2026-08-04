import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

export interface ReplaceFileOptions {
  /** e.g. "Cover image", "Receipt", "QR code image" — used in validation errors */
  subject: string;
  idPrefix: string;
  mimeExtensions: Record<string, string>;
  /** e.g. "PNG, JPEG, WEBP or GIF" */
  allowedLabel: string;
  maxSizeBytes: number;
  isPublic: boolean;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  async uploadPublicFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { error } = await this.client.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }

    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async uploadPrivateFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ): Promise<string> {
    const { error } = await this.client.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }

    return path;
  }

  async createSignedUrl(
    bucket: string,
    path: string,
    expiresInSeconds: number,
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to create signed URL: ${error?.message}`,
      );
    }

    return data.signedUrl;
  }

  /**
   * Validates and uploads a replacement file for a given bucket. Consolidates
   * the validate → path → upload sequence shared by every "single file per
   * record" upload (event cover, receipt, PIX QR code). Deleting the stale
   * previous file is left to the caller, to run only after its own save
   * succeeds — see deletePublicFileByUrl / deletePrivateFile.
   */
  async replaceFile(
    bucket: string,
    file: Express.Multer.File,
    options: ReplaceFileOptions,
  ): Promise<string> {
    const extension = options.mimeExtensions[file.mimetype];
    if (!extension) {
      throw new BadRequestException(
        `${options.subject} must be ${options.allowedLabel}`,
      );
    }
    if (file.size > options.maxSizeBytes) {
      const maxMb = Math.floor(options.maxSizeBytes / (1024 * 1024));
      throw new BadRequestException(
        `${options.subject} must be at most ${maxMb}MB`,
      );
    }

    const path = `${options.idPrefix}-${Date.now()}.${extension}`;
    return options.isPublic
      ? await this.uploadPublicFile(bucket, path, file.buffer, file.mimetype)
      : await this.uploadPrivateFile(bucket, path, file.buffer, file.mimetype);
  }

  async deletePublicFileByUrl(
    bucket: string,
    publicUrl: string,
  ): Promise<void> {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = publicUrl.indexOf(marker);
    if (index === -1) {
      return;
    }
    const path = publicUrl.slice(index + marker.length);
    await this.deleteFile(bucket, path);
  }

  async deletePrivateFile(bucket: string, path: string): Promise<void> {
    await this.deleteFile(bucket, path);
  }

  private async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove([path]);
    if (error) {
      this.logger.warn(
        `Failed to delete stale file "${path}": ${error.message}`,
      );
    }
  }
}
