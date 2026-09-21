import "./index.css";
import { Composition } from "remotion";
import { LiveWalkthrough } from "./LiveWalkthrough";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="LiveWalkthrough"
      component={LiveWalkthrough}
      durationInFrames={1150}
      fps={25}
      width={1440}
      height={900}
    />
  );
};
