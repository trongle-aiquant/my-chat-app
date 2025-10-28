import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Message, MessagesCollection } from '../../api/messages';

interface UsePaginatedMessagesOptions {
  conversationId?: string | null;
  limit?: number;
  enabled?: boolean; // Cho phép bật/tắt pagination
}

interface UsePaginatedMessagesResult {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
}

/**
 * Custom hook để sử dụng cursor-based pagination cho messages
 * 
 * Features:
 * - Load messages theo batch (default 30 messages)
 * - Infinite scroll: Load more khi scroll lên đầu
 * - Realtime: Tin nhắn mới vẫn được subscribe và hiển thị ngay
 * - Performance: Sử dụng cursor-based pagination (không dùng skip/limit)
 * 
 * @param options - Configuration options
 * @returns Messages data và các functions để load more
 */
export const usePaginatedMessages = (
  options: UsePaginatedMessagesOptions = {}
): UsePaginatedMessagesResult => {
  const { conversationId = null, limit = 30, enabled = true } = options;

  // State để track cursor (oldest message _id đã load)
  const [oldestMessageId, setOldestMessageId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Ref để track subscription handle
  const subscriptionHandleRef = useRef<Meteor.SubscriptionHandle | null>(null);

  // Subscribe to paginated messages
  const isLoading = useTracker(() => {
    if (!enabled) {
      return false;
    }

    // Subscribe với cursor hiện tại
    const handle = Meteor.subscribe(
      'messages.paginated',
      oldestMessageId,
      limit,
      conversationId
    );

    // Lưu handle để có thể stop sau này nếu cần
    subscriptionHandleRef.current = handle;

    return !handle.ready();
  }, [oldestMessageId, limit, conversationId, enabled]);

  // Get messages từ local collection
  const messages = useTracker(() => {
    if (!enabled) {
      return [];
    }

    const query: any = {};
    if (conversationId) {
      query.conversationId = conversationId;
    }

    // Lấy tất cả messages đã load (không filter by cursor ở client)
    // Sort ASC để hiển thị đúng thứ tự (cũ nhất → mới nhất)
    return MessagesCollection.find(query, {
      sort: { createdAt: 1, _id: 1 },
    }).fetch();
  }, [conversationId, enabled]);

  // Update hasMore flag khi messages thay đổi
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Nếu số messages nhận được < limit, nghĩa là không còn messages cũ hơn
    // NOTE: Logic này có thể không chính xác 100% vì messages có thể được thêm realtime
    // Nhưng đủ tốt cho hầu hết trường hợp
    if (messages.length > 0 && messages.length < limit && oldestMessageId === null) {
      setHasMore(false);
    }
  }, [messages.length, limit, oldestMessageId, enabled]);

  // Function để load more messages
  const loadMore = useCallback(() => {
    if (!enabled || isLoading || isLoadingMore || !hasMore) {
      return;
    }

    if (messages.length === 0) {
      // Chưa có messages nào, không cần load more
      return;
    }

    // Set loading state
    setIsLoadingMore(true);

    // Lấy oldest message hiện tại làm cursor
    const oldestMessage = messages[0]; // messages đã sort ASC, nên [0] là cũ nhất
    const newCursor = oldestMessage._id!;

    // Update cursor để trigger re-subscribe
    setOldestMessageId(newCursor);

    // Subscribe với cursor mới
    const handle = Meteor.subscribe(
      'messages.paginated',
      newCursor,
      limit,
      conversationId,
      {
        onReady: () => {
          setIsLoadingMore(false);

          // Check nếu không có messages mới nào được load
          // (số lượng messages không tăng), nghĩa là đã hết
          const currentCount = MessagesCollection.find(
            conversationId ? { conversationId } : {}
          ).count();

          if (currentCount === messages.length) {
            setHasMore(false);
          }
        },
        onStop: (error) => {
          setIsLoadingMore(false);
          if (error) {
            console.error('Error loading more messages:', error);
          }
        },
      }
    );

    subscriptionHandleRef.current = handle;
  }, [enabled, isLoading, isLoadingMore, hasMore, messages, limit, conversationId]);

  // Cleanup subscription khi unmount
  useEffect(() => {
    return () => {
      if (subscriptionHandleRef.current) {
        subscriptionHandleRef.current.stop();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
  };
};

