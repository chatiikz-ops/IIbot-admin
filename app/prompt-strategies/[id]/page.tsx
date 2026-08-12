import { StrategyDetail } from "@/src/features/prompt-strategies/strategy-detail";
export default async function Page({params}:PageProps<"/prompt-strategies/[id]">){const {id}=await params;return <StrategyDetail id={id}/>}
