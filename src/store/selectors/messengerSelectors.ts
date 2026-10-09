import {createSelector} from '@reduxjs/toolkit';
import type {RootState} from '@/store/store';

const selectMessengerState = ({messenger}: RootState) => messenger;

export const noticeSelector = createSelector(selectMessengerState, ({notice}) => notice);

export const pollErrorSelector = createSelector(selectMessengerState, ({pollError}) => pollError);

export const pollAttemptSelector = createSelector(selectMessengerState, ({pollAttempt}) => pollAttempt);

export const newChatSelector = createSelector(selectMessengerState, ({newChat}) => newChat);
