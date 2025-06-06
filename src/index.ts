import { issuer } from '@openauthjs/openauth';

import { object, string } from 'valibot';
import { GoogleProvider } from '@openauthjs/openauth/provider/google';
import { CloudflareStorage } from '@openauthjs/openauth/storage/cloudflare';
import { createClient } from '@openauthjs/openauth/client';

const client = createClient({
	clientID: 'fuadnafiz98.com',
	//TODO: remove hardcoded urls
	issuer: 'http://localhost:3000',
});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const app = issuer({
			providers: {
				google: GoogleProvider({
					clientID: env.GOOGLE_CLIENTID,
					clientSecret: env.GOOGLE_CLIENT_SECRET,
					scopes: ['email', 'profile'],
				}),
			},
			storage: CloudflareStorage({
				namespace: env.POCKET_AUTH_KV,
			}),
			subjects: {
				user: object({
					email: string(),
					// TODO: add more info here
					picture: string(),
					name: string(),
				}),
			},
			success: async (ctx, value) => {
				if (value.provider === 'google') {
					const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
						headers: {
							Authorization: `Bearer ${value.tokenset.access}`,
						},
					});
					const data: any = await response.json();
					return ctx.subject('user', {
						email: data.email,
						picture: data.picture,
						name: data.given_name,
					});
				}
				return new Response('success');
			},
		});
		return app.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
