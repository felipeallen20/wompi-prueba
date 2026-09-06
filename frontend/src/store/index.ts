import { createStore } from 'vuex';

export interface RootState {
  checkoutStep: string;
}

export const store = createStore<RootState>({
  state: {
    checkoutStep: 'products',
  },
});