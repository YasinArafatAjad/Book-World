import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedDescription = ({ text, maxLength = 300 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded ? text : text.slice(0, maxLength);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="prose dark:prose-invert"
      >
        <p className="text-gray-600 dark:text-gray-300">
          {displayText}
          {!isExpanded && shouldTruncate && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary-600 dark:text-primary-400"
            >
              ...
            </motion.span>
          )}
        </p>
      </motion.div>
      
      {shouldTruncate && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 focus:outline-none"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </motion.button>
      )}
    </div>
  );
};

export default AnimatedDescription;