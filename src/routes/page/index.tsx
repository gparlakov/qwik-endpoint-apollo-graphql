import { Resource, component$, useResource$, useSignal } from '@builder.io/qwik';
import { gqlCall } from './gql-call';
import { RequestHandler, routeLoader$ } from '@builder.io/qwik-city';

const titlesQuery = `#gql
query BookTitlesQuery {
    books {
        title
    }
}
`

export const onRequest: RequestHandler = ({ sharedMap, url }) => {
    url.pathname = '/graphql'
    const gqlURL = url.href
    sharedMap.set('graphql', gqlURL);
}

export const useGraphQLRoute = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('graphql') as string;
});

export default component$(() => {
    const url = useGraphQLRoute();
    const reload = useSignal(0);
    const res = useResource$(({ track }) => {
        track(reload)
        return gqlCall<{ books: { title: string }[] }>(url.value, titlesQuery);
    })

    return (
        <>
            <button onClick$={() => reload.value += 1}>🔄</button>
            <Resource
                value={res}
                onResolved={(res) => res?.data != null && Array.isArray(res.data?.books)
                    ? <>{res.data.books.map(b => <div> {b.title}</div>)}</>
                    : <div>{JSON.stringify(res)}</div>
                }
            />
        </>
    );
});
