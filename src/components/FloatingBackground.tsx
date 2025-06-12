
const FloatingBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Main floating hearts */}
      {[...Array(25)].map((_, i) => (
        <div
          key={`heart-${i}`}
          className="absolute text-pink-400 opacity-20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
            fontSize: `${10 + Math.random() * 16}px`,
          }}
        >
          💖
        </div>
      ))}
      
      {/* Pulsing hearts */}
      {[...Array(10)].map((_, i) => (
        <div
          key={`pulse-${i}`}
          className="absolute text-pink-300 animate-pulse-heart"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            fontSize: `${8 + Math.random() * 12}px`,
          }}
        >
          💕
        </div>
      ))}
      
      {/* Sparkles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute text-pink-200 opacity-30 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
            fontSize: `${6 + Math.random() * 10}px`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

export default FloatingBackground;
