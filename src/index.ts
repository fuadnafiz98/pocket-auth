import { issuer } from '@openauthjs/openauth';

import { object, string } from 'valibot';
import { GoogleProvider } from '@openauthjs/openauth/provider/google';
import { CloudflareStorage } from '@openauthjs/openauth/storage/cloudflare';

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
				}),
			},
			success: async (response, input, req) => {
				console.log(response, input, req);
				return new Response('success');
			},
		});
		return app.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
