import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', details: parseError instanceof Error ? parseError.message : 'Unknown error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    const { endpoint, method = 'GET', body, params, bearerToken } = requestBody;
    
    const API_BASE_URL = Deno.env.get('VITE_API_BASE_URL') || 'http://173.212.225.22:1230';
    // Use bearer token from request body if provided, otherwise use env variable
    const API_TOKEN = bearerToken || Deno.env.get('VITE_API_BEARER_TOKEN');
    
    console.log('Proxy API called:', { 
      endpoint, 
      method, 
      hasToken: !!API_TOKEN, 
      tokenLength: API_TOKEN?.length,
      receivedBearerToken: !!bearerToken 
    });
    
    if (!API_TOKEN) {
      console.error('Missing API Bearer Token');
      return new Response(
        JSON.stringify({ error: 'API configuration error: Missing bearer token' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Build URL with query params
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }
    
    console.log('Calling external API:', url);
    console.log('Using bearer token:', {
      hasToken: !!API_TOKEN,
      tokenLength: API_TOKEN?.length,
      tokenPreview: API_TOKEN ? API_TOKEN.substring(0, 50) + '...' : 'MISSING'
    });
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
      console.log('Request body:', JSON.stringify(body).substring(0, 200));
    }
    
    console.log('Request headers:', {
      'Content-Type': options.headers?.['Content-Type'],
      'Authorization': options.headers?.['Authorization'] ? `Bearer ${API_TOKEN.substring(0, 20)}...` : 'MISSING'
    });
    
    const response = await fetch(url, options);
    
    console.log('External API response status:', response.status);
    
    let data;
    try {
      const responseText = await response.text();
      console.log('External API response text (first 500 chars):', responseText.substring(0, 500));
      
      if (responseText) {
        data = JSON.parse(responseText);
      } else {
        data = {};
      }
    } catch (parseError) {
      console.error('Failed to parse external API response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse API response', details: parseError instanceof Error ? parseError.message : 'Unknown error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    if (!response.ok) {
      console.error('API request failed:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        responseData: data
      });
    }
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status 
      }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
