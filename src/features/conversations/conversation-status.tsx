import {StatusBadge} from "@/src/components/ui/ui";import {statusLabel,ConversationStatus} from "./types";
export function ConversationStatusBadge({status}:{status:ConversationStatus}){const tone=status==="HANDOFF_REQUIRED"?"warning":status==="QUALIFIED"?"success":status==="REJECTED"||status==="CLOSED"?"danger":"info";return <StatusBadge tone={tone}>{statusLabel(status)}</StatusBadge>}
