export const MOTION_VARIANTS = {
  card: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)',
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  },
  modal: {
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    content: {
      initial: { opacity: 0, scale: 0.9, y: 50 },
      animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 30,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        y: 50,
        transition: { duration: 0.2 },
      },
    },
  },
  column: {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 250,
        damping: 25,
      },
    },
    exit: { opacity: 0, x: 20 },
  },
  glitch: {
    animate: {
      x: [0, -2, 2, -1, 1, 0],
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  },
} as const;

export const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
} as const;
