import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { formatCurrency, formatDate } from '../lib/utils';
import { Play, Pause, RotateCcw } from 'lucide-react';
import gsap from 'gsap';

export default function Timeline() {
  const { items } = useAppSelector(state => state.transactions);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const sortedItems = [...items].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll('.timeline-item');
    
    gsap.set(elements, { opacity: 0, y: 50, scale: 0.9 });

    timelineRef.current = gsap.timeline({
      paused: true,
      onUpdate: function() {
        setProgress(this.progress() * 100);
      },
      onComplete: () => setIsPlaying(false)
    });

    elements.forEach((el, index) => {
      timelineRef.current?.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
      }, index * 0.2); // Stagger
    });

    return () => {
      timelineRef.current?.kill();
    };
  }, [items]);

  const togglePlay = () => {
    if (!timelineRef.current) return;
    
    if (isPlaying) {
      timelineRef.current.pause();
    } else {
      if (timelineRef.current.progress() === 1) {
        timelineRef.current.restart();
      } else {
        timelineRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (!timelineRef.current) return;
    timelineRef.current.restart();
    timelineRef.current.pause();
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-8 px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Financial Timeline</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Watch your spending story unfold</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-900 p-1.5 sm:p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <button 
            onClick={restart}
            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button 
            onClick={togglePlay}
            className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            {isPlaying ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Play</>}
          </button>
        </div>
      </div>

      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div ref={containerRef} className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 sm:ml-4 space-y-5 sm:space-y-8 pb-8">
        {sortedItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions to display.</p>
        ) : (
          sortedItems.map((t, i) => (
            <div key={t.id} className="timeline-item relative pl-5 sm:pl-8">
              <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-950 ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
              
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-2 mb-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {formatDate(t.date)}
                    </span>
                    <h4 className="text-base sm:text-lg font-medium mt-1">{t.description}</h4>
                  </div>
                  <span className={`text-base sm:text-lg font-bold shrink-0 ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  {t.category}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
