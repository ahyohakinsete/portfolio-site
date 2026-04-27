import React from 'react';

export const formatTitleWithHollowPeriods = (title) => {
    console.log('formatTitle called with:', title);
  if (!title || typeof title !== 'string') {
    return title;
  }
  
  // Split by period
  const parts = title.split('.');
  
  // If no periods, return as-is
  if (parts.length === 1) {
    return title;
  }
  
  // Build the result with hollow periods
  return parts.map((part, index) => {
    // Don't add period after last part
    if (index === parts.length - 1) {
      return <React.Fragment key={index}>{part}</React.Fragment>;
    }
    
    // Add part + hollow period
    return (
      <React.Fragment key={index}>
        {part}
        <span className="hollow-period"></span>
      </React.Fragment>
    );
  });
};