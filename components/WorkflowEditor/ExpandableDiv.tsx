import React, { useState } from "react";
import { useIntl } from "react-intl";

type Props = {
  content: React.ReactNode;
  removeButton: React.ReactNode;
};

const ExpandableDiv: React.FC<Props> = ({ content, removeButton }) => {
  const intl = useIntl();
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
          {isExpanded
            ? intl.formatMessage({
                id: "components.ExpandableDiv.expand",
              })
            : "▼"}
        </div>
        {isExpanded ? <div></div> : removeButton}
      </div>
      <div className="content">{isExpanded ? null : content}</div>
    </div>
  );
};

export default ExpandableDiv;
