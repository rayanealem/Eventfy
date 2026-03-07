import { createContext, useContext, useReducer, useCallback } from 'react';

const EventStoreContext = createContext(null);

const initialState = {
    registeredEvents: {},   // { [eventId]: true }
    savedEvents: {},        // { [eventId]: true }
    followedOrgs: {},       // { [orgId]: true }
    feedScrollY: 0,
};

function reducer(state, action) {
    switch (action.type) {
        case 'REGISTER_EVENT':
            return { ...state, registeredEvents: { ...state.registeredEvents, [action.id]: true } };
        case 'UNREGISTER_EVENT': {
            const next = { ...state.registeredEvents };
            delete next[action.id];
            return { ...state, registeredEvents: next };
        }
        case 'TOGGLE_SAVE': {
            const isSaved = !!state.savedEvents[action.id];
            const next = { ...state.savedEvents };
            if (isSaved) delete next[action.id];
            else next[action.id] = true;
            return { ...state, savedEvents: next };
        }
        case 'SET_SAVED':
            return { ...state, savedEvents: { ...state.savedEvents, [action.id]: action.value } };
        case 'FOLLOW_ORG':
            return { ...state, followedOrgs: { ...state.followedOrgs, [action.id]: true } };
        case 'UNFOLLOW_ORG': {
            const next = { ...state.followedOrgs };
            delete next[action.id];
            return { ...state, followedOrgs: next };
        }
        case 'TOGGLE_FOLLOW_ORG': {
            const isFollowed = !!state.followedOrgs[action.id];
            const next = { ...state.followedOrgs };
            if (isFollowed) delete next[action.id];
            else next[action.id] = true;
            return { ...state, followedOrgs: next };
        }
        case 'SET_FEED_SCROLL':
            return { ...state, feedScrollY: action.y };
        case 'BULK_SET_REGISTERED': {
            const map = {};
            (action.ids || []).forEach(id => { map[id] = true; });
            return { ...state, registeredEvents: { ...state.registeredEvents, ...map } };
        }
        case 'BULK_SET_SAVED': {
            const map = {};
            (action.ids || []).forEach(id => { map[id] = true; });
            return { ...state, savedEvents: { ...state.savedEvents, ...map } };
        }
        case 'BULK_SET_FOLLOWED': {
            const map = {};
            (action.ids || []).forEach(id => { map[id] = true; });
            return { ...state, followedOrgs: { ...state.followedOrgs, ...map } };
        }
        default:
            return state;
    }
}

export function EventStoreProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const isRegistered = useCallback((id) => !!state.registeredEvents[id], [state.registeredEvents]);
    const isSaved = useCallback((id) => !!state.savedEvents[id], [state.savedEvents]);
    const isFollowing = useCallback((id) => !!state.followedOrgs[id], [state.followedOrgs]);

    return (
        <EventStoreContext.Provider value={{ ...state, dispatch, isRegistered, isSaved, isFollowing }}>
            {children}
        </EventStoreContext.Provider>
    );
}

export const useEventStore = () => useContext(EventStoreContext);
