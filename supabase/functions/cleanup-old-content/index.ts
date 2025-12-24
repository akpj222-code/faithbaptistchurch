import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date 3 months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cutoffDate = threeMonthsAgo.toISOString();

    console.log(`Starting cleanup for content older than: ${cutoffDate}`);

    // Track deleted counts
    const deletedCounts = {
      stories: 0,
      announcements: 0,
      dailyManna: 0,
      dailyVerses: 0,
    };

    // 1. Delete old stories (keep media files in storage for now, could add cleanup later)
    const { data: oldStories, error: storiesError } = await supabase
      .from('stories')
      .select('id, media_url')
      .lt('created_at', cutoffDate);

    if (storiesError) {
      console.error('Error fetching old stories:', storiesError);
    } else if (oldStories && oldStories.length > 0) {
      // Delete associated media from storage
      for (const story of oldStories) {
        if (story.media_url && story.media_url.includes('/media/')) {
          const path = story.media_url.split('/media/')[1];
          if (path) {
            const { error: storageError } = await supabase.storage
              .from('media')
              .remove([path]);
            if (storageError) {
              console.warn(`Failed to delete media: ${path}`, storageError);
            }
          }
        }
      }

      // Delete the stories
      const { error: deleteError } = await supabase
        .from('stories')
        .delete()
        .lt('created_at', cutoffDate);

      if (deleteError) {
        console.error('Error deleting old stories:', deleteError);
      } else {
        deletedCounts.stories = oldStories.length;
        console.log(`Deleted ${oldStories.length} old stories`);
      }
    }

    // 2. Delete old announcements (EXCEPT pinned ones)
    const { data: oldAnnouncements, error: announcementsError } = await supabase
      .from('church_announcements')
      .select('id')
      .lt('created_at', cutoffDate)
      .eq('is_pinned', false);

    if (announcementsError) {
      console.error('Error fetching old announcements:', announcementsError);
    } else if (oldAnnouncements && oldAnnouncements.length > 0) {
      const { error: deleteError } = await supabase
        .from('church_announcements')
        .delete()
        .lt('created_at', cutoffDate)
        .eq('is_pinned', false);

      if (deleteError) {
        console.error('Error deleting old announcements:', deleteError);
      } else {
        deletedCounts.announcements = oldAnnouncements.length;
        console.log(`Deleted ${oldAnnouncements.length} old announcements (pinned excluded)`);
      }
    }

    // 3. Delete old daily manna entries
    const { data: oldManna, error: mannaError } = await supabase
      .from('daily_manna')
      .select('id')
      .lt('created_at', cutoffDate);

    if (mannaError) {
      console.error('Error fetching old manna:', mannaError);
    } else if (oldManna && oldManna.length > 0) {
      const { error: deleteError } = await supabase
        .from('daily_manna')
        .delete()
        .lt('created_at', cutoffDate);

      if (deleteError) {
        console.error('Error deleting old manna:', deleteError);
      } else {
        deletedCounts.dailyManna = oldManna.length;
        console.log(`Deleted ${oldManna.length} old daily manna entries`);
      }
    }

    // 4. Delete old daily verses
    const { data: oldVerses, error: versesError } = await supabase
      .from('daily_verses')
      .select('id')
      .lt('created_at', cutoffDate);

    if (versesError) {
      console.error('Error fetching old verses:', versesError);
    } else if (oldVerses && oldVerses.length > 0) {
      const { error: deleteError } = await supabase
        .from('daily_verses')
        .delete()
        .lt('created_at', cutoffDate);

      if (deleteError) {
        console.error('Error deleting old verses:', deleteError);
      } else {
        deletedCounts.dailyVerses = oldVerses.length;
        console.log(`Deleted ${oldVerses.length} old daily verses`);
      }
    }

    const totalDeleted = Object.values(deletedCounts).reduce((a, b) => a + b, 0);
    console.log(`Cleanup complete. Total items deleted: ${totalDeleted}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup complete. Deleted ${totalDeleted} items.`,
        details: deletedCounts,
        cutoffDate,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
