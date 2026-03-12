import { List, Map as ImmutableMap } from 'immutable';

import { STORE_HYDRATE } from '../actions/store';

const initialState = ImmutableMap({
  accept_content_types: List(),
});

export default function meta(state = initialState, action) {
  switch(action.type) {
  case STORE_HYDRATE:
    return state.merge(action.state.get('media_attachments'));
  default:
    return state;
  }
}
