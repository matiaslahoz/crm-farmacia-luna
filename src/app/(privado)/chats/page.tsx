"use client";

import SessionsList from "./components/SessionsList";
import Conversation from "./components/Conversation";
import { useChatsPage } from "./hooks/useChatsPage";

export default function ChatsPage() {
  const {
    isMobile,
    query,
    setQuery,
    selectedUserId,
    handleSelectUser,
    groups,
    currentGroup,
    title,
    msgsDisplay,
    loadingMsgs,
    hasMore,
    loadMoreConversation,
    unreadCounts,
    loadMoreSessions,
    hasMoreSessions,
    loadingSessions,
  } = useChatsPage({ breakpoint: 640 });

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
            isMobile && selectedUserId ? "translateX(-100%)" : "translateX(0)",
        }}
      >
        <SessionsList
          groups={groups}
          selectedUserId={selectedUserId}
          query={query}
          setQuery={setQuery}
          onSelect={handleSelectUser}
          unreadCounts={unreadCounts}
          loadMoreSessions={loadMoreSessions}
          hasMoreSessions={hasMoreSessions}
          loadingSessions={loadingSessions}
        />
      </div>

      <div
        className={`flex-1 min-w-0 h-full relative bg-gray-50 ${
          isMobile && !selectedUserId ? "hidden" : "block"
        }`}
      >
        <Conversation
          title={title}
          phone={currentGroup?.phone}
          msgs={msgsDisplay}
          loading={loadingMsgs}
          hasMore={hasMore}
          onLoadMoreConversation={loadMoreConversation}
          onBack={isMobile ? () => handleSelectUser(0) : undefined}
        />
      </div>
    </div>
  );
}
