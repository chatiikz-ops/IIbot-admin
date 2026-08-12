import { ContactDetail } from "@/src/features/contacts/contact-detail";
export default async function Page({params}:PageProps<"/contacts/[id]">){const {id}=await params;return <ContactDetail id={id}/>}
