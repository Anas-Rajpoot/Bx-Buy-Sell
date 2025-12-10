import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  console.log('get-users-with-emails function invoked')
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the JWT token from the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey
    })

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Create client with user's JWT to verify authentication
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Verify user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      console.error('Role check failed:', roleError)
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    console.log(`Admin user ${user.id} authenticated, creating admin client...`)

    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Admin client created, fetching users...')

    // Get all users from auth.users using admin client
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      throw authError
    }

    console.log(`Found ${authUsers.users.length} auth users`)

    // Get profiles for all users
    const userIds = authUsers.users.map(u => u.id)
    console.log(`Fetching profiles for ${userIds.length} users`)
    
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', userIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      throw profilesError
    }

    console.log(`Found ${profiles?.length || 0} profiles`)

    // Get listing counts for each user
    const { data: listingCounts, error: listingsError } = await supabaseAdmin
      .from('listings')
      .select('user_id')
      .in('user_id', userIds)

    if (listingsError) {
      console.error('Error fetching listings:', listingsError)
    }

    console.log(`Found ${listingCounts?.length || 0} listings`)

    // Count listings per user
    const listingsPerUser = listingCounts?.reduce((acc, listing) => {
      acc[listing.user_id] = (acc[listing.user_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Combine all data
    const users = authUsers.users.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id)
      return {
        id: authUser.id,
        email: authUser.email,
        phone: authUser.phone,
        created_at: authUser.created_at,
        email_confirmed_at: authUser.email_confirmed_at,
        phone_confirmed_at: authUser.phone_confirmed_at,
        last_sign_in_at: authUser.last_sign_in_at,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
        user_type: profile?.user_type,
        listings_count: listingsPerUser[authUser.id] || 0,
      }
    })

    console.log(`Returning ${users.length} users`)

    return new Response(
      JSON.stringify({ users }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in get-users-with-emails:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack
    })
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorStack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
