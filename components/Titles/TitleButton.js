import Button from '@/components/ui/Button';
import { useState } from 'react';
import LoadingDots from '@/components/ui/LoadingDots';
import { createPopper } from '@popperjs/core';
import React from 'react';

export default function TitleButton({
  pushTitle,
  title_id,
  refreshStats,
  variant,
  disabled,
  title_name,
  description
}) {
  const [saving, setSaving] = useState(false);

  const [popoverShow, setPopoverShow] = React.useState(false);
  const btnRef = React.createRef();
  const popoverRef = React.createRef();
  const openTooltip = () => {
    createPopper(btnRef.current, popoverRef.current, {
      placement: 'top'
    });
    setPopoverShow(true);
  };
  const closeTooltip = () => {
    setPopoverShow(false);
  };

  return (
    <div className="flex flex-wrap">
      <div className="w-full text-center">
        <div>
          <Button
            onClick={() => pushTitle(title_id, refreshStats, setSaving)}
            variant={variant}
            disabled={disabled}
            className="py-2 px-4 w-full text-white font-bold border rounded"
            ref={btnRef}
          >
            {saving ? <LoadingDots /> : title_name}
            {/* <a
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            className="ml-1.5 text-xs fas fa-question-circle"
          /> */}
          </Button>
          {description ? <button onMouseEnter={openTooltip} onMouseLeave={closeTooltip} className="text-xs">Learn More</button> : null }
        </div>
        {description ? (
          <div
            className={
              (popoverShow ? '' : 'hidden ') +
              'bg-primary-3 border-0 mr-3 block z-50 font-normal leading-normal text-sm max-w-xs text-left no-underline break-words rounded-lg'
            }
            ref={popoverRef}
          >
            <div>
              <div className="text-white p-3">{description}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
