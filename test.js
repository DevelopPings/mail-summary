// import OpenAI from 'openai';
// import { chatGPTKey } from './key/setting.js';

// const key = settings.key;
// console.log(chatGPTKey);
// const openai = new OpenAI({ apiKey: key });

// async function main() {
// 	const response = await openai.chat.completions.create({
// 		model: 'gpt-4o-mini',
// 		messages: [
// 			{
// 				role: 'user',
// 				content: [
// 					{ type: 'text', text: 'What’s in this image?' },
// 					{
// 						type: 'image_url',
// 						image_url: {
// 							url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg',
// 						},
// 					},
// 				],
// 			},
// 		],
// 	});
// 	console.log(response.choices[0]);
// }
// main();
