import React from "react";
import PlayerGameScreen from "@/components/play/PlayerGameScreen";

export default async function Page(props: {
  params: Promise<{ pin: string; participantId: string }>;
}) {
  const params = await props.params;

  return (
    <PlayerGameScreen pin={params.pin} participantId={params.participantId} />
  );
}
