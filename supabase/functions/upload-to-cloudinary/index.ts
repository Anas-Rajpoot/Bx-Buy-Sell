import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY');
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET');

    console.log('Cloudinary config check:', {
      hasCloudName: !!cloudName,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      cloudNameLength: cloudName?.length || 0
    });

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured properly. Please check your secrets.');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Uploading file to Cloudinary:', file.name);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode(...bytes));
    const dataURI = `data:${file.type};base64,${base64}`;

    // Generate timestamp for signature
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create signature string - Cloudinary format: timestamp=XXX + api_secret
    const paramsToSign = `timestamp=${timestamp}${apiSecret}`;
    
    // Generate SHA-1 signature using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Signature generated, uploading to cloud:', cloudName);

    // Upload to Cloudinary with signed request
    const uploadFormData = new FormData();
    uploadFormData.append('file', dataURI);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', timestamp.toString());
    uploadFormData.append('signature', signature);
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const uploadResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error('Cloudinary upload failed:', errorData);
      throw new Error(`Cloudinary upload failed: ${uploadResponse.statusText}`);
    }

    const result = await uploadResponse.json();
    console.log('Upload successful:', result.secure_url);

    return new Response(
      JSON.stringify({ 
        success: true, 
        url: result.secure_url,
        publicId: result.public_id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in upload-to-cloudinary function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
