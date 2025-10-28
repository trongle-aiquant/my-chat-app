import { Meteor } from 'meteor/meteor';
import { MessagesCollection } from './messages';

Meteor.publish('messages', function () {
  // Publish all messages với TẤT CẢ các fields (bao gồm seenBy)
  // Sorted by creation date, limit 100 messages gần nhất
  // TODO: Implement cursor-based pagination để tối ưu hiệu suất
  return MessagesCollection.find(
    {},
    {
      sort: { createdAt: 1 },
      limit: 100, // Limit to last 100 messages
      // Không cần chỉ định fields vì mặc định Meteor publish tất cả fields
    }
  );
});
