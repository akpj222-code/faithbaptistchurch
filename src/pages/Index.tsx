import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BibleReader } from '@/components/bible/BibleReader';
import { DailyVerseNotification } from '@/components/notifications/DailyVerseNotification';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const Index = () => {
  const [showDailyVerse, setShowDailyVerse] = useState(false);
  const [hasVerse, setHasVerse] = useState(false);

  useEffect(() => {
    checkDailyVerse();
  }, []);

  const checkDailyVerse = async () => {
    // Check if we've shown the daily verse today
    const lastShown = localStorage.getItem('dailyVerseLastShown');
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (lastShown === today) {
      return; // Already shown today
    }

    // Check if there's a verse for today
    const { data } = await supabase
      .from('daily_verses')
      .select('id')
      .eq('date', today)
      .single();

    if (data) {
      setHasVerse(true);
      // Small delay for better UX
      setTimeout(() => setShowDailyVerse(true), 500);
    }
  };

  const handleCloseVerse = () => {
    setShowDailyVerse(false);
    // Mark as shown for today
    localStorage.setItem('dailyVerseLastShown', format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <AppLayout>
      <BibleReader />
      {showDailyVerse && hasVerse && (
        <DailyVerseNotification onClose={handleCloseVerse} />
      )}
    </AppLayout>
  );
};

export default Index;
