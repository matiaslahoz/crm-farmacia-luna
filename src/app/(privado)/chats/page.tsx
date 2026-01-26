"use client";

import SessionsList from "./components/SessionsList";
import Conversation from "./components/Conversation";
import { useChatsPage } from "./hooks/useChatsPage";

export default function ChatsPage() {
  const {
    isMobile,
    query,
    setQuery,
    selectedPhone,
    setSelectedPhone,
    groups,
    currentGroup,
    lastPreview,
    unreadCounts,
    title,
    meta,
    msgsDisplay,
    loadingMsgs,
    hasMore,
    loadMore,
    handleSelectPhone,
  } = useChatsPage({ breakpoint: 640, sessionsLimit: 400 });

  return (
    <div className="flex h-full min-h-0 w-full">
      <div
        className={`
    min-h-0 bg-white border-r border-gray-200 z-10
    w-full sm:w-[330px] sm:flex-shrink-0
    ${isMobile ? "fixed left-0" : "relative"}
    transition-transform duration-200
  `}
        style={{
          top: isMobile ? 56 : undefined,
          height: isMobile ? "calc(100dvh - 56px)" : "100%",
          transform:
            isMobile && selectedPhone ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        <SessionsList
          groups={groups}
          selectedPhone={selectedPhone}
          query={query}
          setQuery={setQuery}
          onSelect={handleSelectPhone}
          unreadCounts={unreadCounts}
          lastPreview={lastPreview}
        />
      </div>

      <div
        className={`flex-1 min-w-0 h-full relative bg-gray-50 ${
          isMobile && !selectedPhone ? "hidden" : "block"
        }`}
      >
        <Conversation
          title={title}
          phone={currentGroup?.phone}
          meta={meta}
          msgs={msgsDisplay}
          loading={loadingMsgs}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onBack={isMobile ? () => setSelectedPhone(null) : undefined}
        />
      </div>
    </div>
  );
}
