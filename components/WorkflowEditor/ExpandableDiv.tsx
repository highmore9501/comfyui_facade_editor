import React, { useState } from "react";

type Props = {
  content: React.ReactNode;
  removeButton: React.ReactNode;
};

const ExpandableDiv: React.FC<Props> = ({ content, removeButton }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={
        isExpanded ? "" : "container border border-gray-300 p-2 rounded-md mb-2"
      }
    >
      <div className="flex flex-row justify-between">
        <div className="cursor-pointer" onClick={toggleExpand}>
          {isExpanded ? "► 点击展开..." : "▼"}
        </div>
        {isExpanded ? <div></div> : removeButton}
      </div>
      <div className="content">{isExpanded ? <div></div> : content}</div>
    </div>
  );
};

export default ExpandableDiv;
