
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Volume2 } from "lucide-react";

export default function TreyWidget() {
  const [playing, setPlaying] = useState(false);
  const [pose, setPose] = useState("neutral");

  const handlePlay = () => {
    const audio = new Audio("/audio/hello.wav");
    audio.play();
    setPlaying(true);
    audio.onended = () => setPlaying(false);
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/secret_bookshelf.png')" }}
    >
      <Card className="w-[320px] bg-white/70 backdrop-blur rounded-2xl shadow-xl">
        <CardContent className="flex flex-col items-center p-4">
          <img
            src={`/images/trey_avatar_${pose}.png`}
            alt="Trey Avatar"
            className="w-32 h-32 rounded-full shadow-md mb-4"
          />
          <h2 className="text-xl font-semibold text-center mb-2">Trey AI Widget</h2>
          <div className="flex gap-2 mb-4">
            <Button onClick={() => setPose("neutral")}>Neutral</Button>
            <Button onClick={() => setPose("happy")}>Happy</Button>
            <Button onClick={() => setPose("angry")}>Angry</Button>
            <Button onClick={() => setPose("confused")}>Confused</Button>
          </div>
          <Button
            className="w-full flex items-center gap-2"
            onClick={handlePlay}
            disabled={playing}
          >
            <Volume2 className="w-5 h-5" />
            {playing ? "Speaking..." : "Say Hello"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
