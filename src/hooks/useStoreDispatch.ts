import {useDispatch} from 'react-redux';
import type {DispatchType} from '@/store/store';

export default useDispatch.withTypes<DispatchType>();
