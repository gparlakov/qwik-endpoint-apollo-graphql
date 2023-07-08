import { RequestHandler } from '@builder.io/qwik-city'

export const onRequest: RequestHandler = (({send}) => {
    send(200, 'Success')
})
