import { CampaignDetail } from "@/src/features/campaigns/campaign-detail";
export default async function Page({params}:PageProps<"/campaigns/[id]">){const {id}=await params;return <CampaignDetail id={id}/>}
