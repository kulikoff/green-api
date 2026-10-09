import {createSelector} from '@reduxjs/toolkit';
import type {RootState} from '@/store/store';

const selectSessionState = ({session}: RootState) => session;

export const credentialsSelector = createSelector(selectSessionState, ({credentials}) => credentials);
