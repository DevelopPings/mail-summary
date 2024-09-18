import OpenAI from 'openai';
// import { chatGPTKey } from './key/setting.js';

const key =
	'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';

const openai = new OpenAI({ apiKey: key });

async function main(content) {
	const response = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{
				role: 'user',
				content: [
					// { type: 'text', text: 'What’s in this image?' },
					{ type: 'text', text: content },
					// {
					// 	type: 'image_url',
					// 	image_url: {
					// 		url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
					// 	},
					// },
				],
			},
		],
	});
	console.log(response.choices[0]);
}
export { main };
