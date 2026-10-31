import { supabase } from '@/lib/supabase';

export type StorageBucket = 'farm-media' | 'activities' | 'harvests' | 'avatars';

export interface UploadResult {
  url: string | null;
  path: string | null;
  error: Error | null;
}

/**
 * Storage Service for uploading and retrieving field activity photographs,
 * harvest scale proofs, and partner farm media.
 */
export const StorageService = {
  /**
   * Upload an activity progress photo captured by a farmer in the field.
   * Path: activities/{cycleId}/{timestamp}_{filename}.jpg
   */
  async uploadActivityPhoto(
    cycleId: string,
    fileData: Blob | Uint8Array | ArrayBuffer,
    fileName: string = 'field_update.jpg'
  ): Promise<UploadResult> {
    try {
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${cycleId}/${Date.now()}_${sanitizedName}`;

      const { data, error } = await supabase.storage
        .from('activities')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        return { url: null, path: null, error };
      }

      const { data: publicUrlData } = supabase.storage
        .from('activities')
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        path: data.path,
        error: null,
      };
    } catch (err: any) {
      return {
        url: null,
        path: null,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  },

  /**
   * Upload harvest scale weight and grading verification photo.
   * Path: harvests/{orderId}/scale_proof_{timestamp}.jpg
   */
  async uploadHarvestProof(
    orderId: string,
    fileData: Blob | Uint8Array | ArrayBuffer,
    fileName: string = 'scale_proof.jpg'
  ): Promise<UploadResult> {
    try {
      const filePath = `${orderId}/scale_${Date.now()}_${fileName}`;

      const { data, error } = await supabase.storage
        .from('harvests')
        .upload(filePath, fileData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        return { url: null, path: null, error };
      }

      const { data: publicUrlData } = supabase.storage
        .from('harvests')
        .getPublicUrl(data.path);

      return {
        url: publicUrlData.publicUrl,
        path: data.path,
        error: null,
      };
    } catch (err: any) {
      return {
        url: null,
        path: null,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  },

  /**
   * Generate permanent CDN public URL for any stored asset.
   */
  getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },
};
