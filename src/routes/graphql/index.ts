import { ContextFunction, BaseContext, HeaderMap, HTTPGraphQLRequest } from '@apollo/server';
import { RequestHandler } from '@builder.io/qwik-city';
import { serverStarted, server } from '~/graphql';

export const onRequest: RequestHandler = async ({
  parseBody,
  method,
  next,
  send,
  request,
  query,
  getWritableStream,
}) => {
  await serverStarted;

  // from expressMiddleware node_modules/@apollo/server/src/express4/index.ts
  server.assertStarted('QWIK Endpoint');

  // This `any` is safe because the overload above shows that context can
  // only be left out if you're using BaseContext as your context, and {} is a
  // valid BaseContext.
  const defaultContext: ContextFunction<[{}], BaseContext> = async () => ({});

  return parseBody().then((body) => {
    const headers = new HeaderMap(request.headers);

    const httpGraphQLRequest: HTTPGraphQLRequest = {
      method: method.toUpperCase(),
      headers,
      search: query.toString() ?? '',
      body: body ?? {},
    };

    return server
      .executeHTTPGraphQLRequest({
        httpGraphQLRequest,
        context: () => defaultContext({}),
      })
      .then(async (httpGraphQLResponse) => {
        if (httpGraphQLResponse.body.kind === 'complete') {
          const response = new Response(httpGraphQLResponse.body.string, {
            status: 200,
            headers: [...httpGraphQLResponse.headers.entries()],
          });

          send(response);
          return;
        }

        const writableStream = getWritableStream();
        const writer = writableStream.getWriter();
        const encoder = new TextEncoder();

        for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
          writer.write(encoder.encode(chunk));
        }
        writer.close();
      })
      .catch((e) => {
        console.error(e);
        next();
      });
  });
};
