import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

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

    const { error } = await this.client.storage.from(bucket).remove([path]);
    if (error) {
      this.logger.warn(
        `Failed to delete stale file "${path}": ${error.message}`,
      );
    }
  }
}
