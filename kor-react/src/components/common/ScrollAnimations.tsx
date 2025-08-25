import { useEffect, useRef } from 'react';

// Custom hook for scroll-triggered animations
export const useScrollAnimation = () => {
  const elementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // Add a class to body to indicate JS animations are enabled
    document.body.classList.add('js-animations-enabled');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -50px 0px', // Start animation slightly before element is fully visible
      }
    );

    // Small delay to ensure all elements are rendered
    const timeoutId = setTimeout(() => {
      // Find all elements with slide-in class and observe them
      const slideInElements = document.querySelectorAll('.slide-in');
      slideInElements.forEach((element) => {
        observer.observe(element);
      });

      elementsRef.current = Array.from(slideInElements) as HTMLElement[];
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      document.body.classList.remove('js-animations-enabled');
      elementsRef.current.forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);
};

// Component to initialize scroll animations
const ScrollAnimations: React.FC = () => {
  useScrollAnimation();
  return null;
};

export default ScrollAnimations;
