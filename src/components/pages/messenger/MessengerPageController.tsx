import {useEffect} from 'react';
import {useSelector} from 'react-redux';
import {MESSAGE_DIRECTIONS, MESSAGE_STATUSES} from '@/constants/chat';
import {generateUserErrorMessage} from '@/utils/common';
import type {ChatMessage} from '@/types/Chat';
import useStoreDispatch from '@/hooks/useStoreDispatch';
import GreenApiService from '@/services/GreenApiService';
import {activeChatSelector, chatListItemsSelector} from '@/store/selectors/chatSelectors';
import {
  newChatSelector,
  noticeSelector,
  pollAttemptSelector,
  pollErrorSelector,
} from '@/store/selectors/messengerSelectors';
import {credentialsSelector} from '@/store/selectors/sessionSelectors';
import chatSlice from '@/store/slices/chatSlice';
import messengerSlice from '@/store/slices/messengerSlice';
import chatThunk from '@/store/thunks/chatThunk';
import sessionThunk from '@/store/thunks/sessionThunk';
import MessengerPage from './MessengerPage';

export default function MessengerPageController() {
  const dispatch = useStoreDispatch();
  const credentials = useSelector(credentialsSelector);
  const items = useSelector(chatListItemsSelector);
  const activeChat = useSelector(activeChatSelector);
  const notice = useSelector(noticeSelector);
  const pollError = useSelector(pollErrorSelector);
  const pollAttempt = useSelector(pollAttemptSelector);
  const {
    isOpen: isNewChatOpen,
    phone: newChatPhone,
    error: newChatError,
    isSubmitting: isCreatingChat,
  } = useSelector(newChatSelector);

  useEffect(() => {
    if (!credentials) {
      return;
    }

    const service = new GreenApiService(credentials);

    const stopPolling = service.startNotificationPolling({
      onNotification: (body) => {
        const incoming = service.readIncomingText(body);

        if (incoming) {
          dispatch(chatSlice.actions.addIncoming(incoming));
        }
      },
      onError: (error) => dispatch(messengerSlice.actions.markPollingFailed(generateUserErrorMessage(error))),
      onSuccess: () => dispatch(messengerSlice.actions.markPollingSucceeded()),
    });

    return stopPolling;
  }, [credentials, dispatch, pollAttempt]);

  const handleSend = async () => {
    if (!activeChat) {
      return;
    }

    const {id, draft} = activeChat;
    const text = draft.trim();
    const localId = crypto.randomUUID();

    const message: ChatMessage = {
      localId,
      remoteId: null,
      text,
      direction: MESSAGE_DIRECTIONS.OUTGOING,
      status: MESSAGE_STATUSES.SENDING,
      createdAt: Date.now(),
    };

    dispatch(chatSlice.actions.changeDraft({chatId: id, draft: ''}));
    dispatch(chatSlice.actions.addOutgoing({chatId: id, message}));
    dispatch(messengerSlice.actions.setNotice(null));
    await dispatch(chatThunk.sendMessage({chatId: id, localId, text}));
  };

  const handleRetry = async (localId: string) => {
    if (!activeChat) {
      return;
    }

    const {id, messages} = activeChat;
    const message = messages.find((message) => {
      const {localId: messageLocalId, status} = message;
      return messageLocalId === localId && status !== MESSAGE_STATUSES.SENDING;
    });

    if (!message) {
      return;
    }

    const {text} = message;

    dispatch(chatSlice.actions.retryOutgoing({chatId: id, localId}));
    await dispatch(chatThunk.sendMessage({chatId: id, localId, text}));
  };

  const handleCreateChat = async () => {
    if (isCreatingChat) {
      return;
    }

    await dispatch(chatThunk.openChat());
  };

  const handleSelectChat = (chatId: string) => dispatch(chatSlice.actions.selectChat(chatId));

  const handleBack = () => dispatch(chatSlice.actions.selectChat(null));

  const handleDraftChange = (draft: string) => {
    if (!activeChat) {
      return;
    }

    const {id} = activeChat;

    dispatch(chatSlice.actions.changeDraft({chatId: id, draft}));
  };

  const handleOpenNewChat = () => dispatch(messengerSlice.actions.openNewChat());

  const handleCloseNewChat = () => dispatch(messengerSlice.actions.closeNewChat());

  const handleNewChatPhoneChange = (phone: string) => dispatch(messengerSlice.actions.changeNewChatPhone(phone));

  const handleRetryPolling = () => dispatch(messengerSlice.actions.retryPolling());

  const handleLogout = () => dispatch(sessionThunk.logout());

  if (!credentials) {
    return null;
  }

  const {idInstance} = credentials;

  return (
    <MessengerPage
      items={items}
      activeChat={activeChat}
      instanceId={idInstance}
      pollError={pollError}
      notice={notice}
      isNewChatOpen={isNewChatOpen}
      newChatPhone={newChatPhone}
      newChatError={newChatError}
      isCreatingChat={isCreatingChat}
      onLogout={handleLogout}
      onSelectChat={handleSelectChat}
      onBack={handleBack}
      onDraftChange={handleDraftChange}
      onSend={handleSend}
      onRetry={handleRetry}
      onOpenNewChat={handleOpenNewChat}
      onCloseNewChat={handleCloseNewChat}
      onNewChatPhoneChange={handleNewChatPhoneChange}
      onCreateChat={handleCreateChat}
      onRetryPolling={handleRetryPolling}
    />
  );
}
