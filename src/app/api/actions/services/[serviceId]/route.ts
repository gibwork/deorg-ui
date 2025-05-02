// import {NextResponse} from "next/server";
// import {
//   ActionGetResponse,
//   ACTIONS_CORS_HEADERS,
// } from "@solana/actions";
// import axios from 'axios'

// export async function GET(
//   request: Request,
//   { params }: { params: { serviceId: string } }
// ) {
//   const res = await axios.get(`${process.env.API_URL}/services/${params.serviceId}`)

//   const response: ActionGetResponse = {
//     type: "action",
//     icon: res.data.images[0],
//     title: res.data.title,
//     description: res.data.content,
//     label: "Action payment",
//     links: {
//       actions: [
//         {
//           type: 'message',
//           href: `/api/actions/services/${params.serviceId}/sign`,
//           label: 'Next'
//         }
//       ],
//     },
//   };

//   return NextResponse.json(response, {
//     headers: ACTIONS_CORS_HEADERS,
//   });
// }

// export const OPTIONS = GET;
