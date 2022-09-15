import { jumper, React, useEffect, useMemo, usePollingQuery, useStyleSheet } from "../../deps.ts";
import {
  ACTIVE_POLL_QUERY,
  CRYSTAL_BALL_ICON,
  CRYSTAL_BALL_ICON_VIEWBOX,
  MOGUL_MENU_JUMPER_MESSAGES,
  ONE_SECOND_MS,
} from "../../shared/mod.ts";
import { usePageStack } from "../page-stack/mod.ts";
import { Poll } from "../../types/mod.ts";
import PredictionPage from "../prediction-page/prediction-page.tsx";
import { useMenu } from "../menu/mod.ts";
import Tile from "../tile/tile.tsx";
import Time from "../time/time.tsx";
import styleSheet from "./prediction-tile.scss.js";

const POLL_INTERVAL = 2 * ONE_SECOND_MS;

function useListenForOpenPrediction(showPredictionPage: () => void) {
  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === MOGUL_MENU_JUMPER_MESSAGES.OPEN_PREDICTION) {
        console.log("showing prediction page");
        showPredictionPage();
      }
    });
  }, []);
}

export default function PredictionTile() {
  useStyleSheet(styleSheet);
  const { setIsOpen } = useMenu();
  const { pushPage } = usePageStack();

  const { data: activePollData } = usePollingQuery(POLL_INTERVAL, {
    query: ACTIVE_POLL_QUERY,
  });

  const activePoll: Poll = useMemo(
    () =>
      activePollData?.pollConnection?.nodes?.find(
        (poll: Poll) => poll?.data?.type === "prediction",
      ),
    [activePollData],
  );

  const pollMsLeft = useMemo(
    () => new Date(activePoll?.endTime || Date.now()).getTime() - Date.now(),
    [activePoll],
  );
  const isPredictionExpired = useMemo(() => pollMsLeft <= 0, [pollMsLeft]);

  const hasWinner = useMemo(
    () => activePoll?.data?.winningOptionIndex !== undefined,
    [activePoll],
  );

  let Content: React.ReactNode;

  if (isPredictionExpired && hasWinner) {
    Content = (
      <div className="content">
        <div className="primary-text">{activePoll?.question}</div>
        <div className="secondary-text">The results are in!</div>
      </div>
    );
  } else if (isPredictionExpired) {
    Content = (
      <div className="content">
        <div className="primary-text">{activePoll?.question}</div>
        <div className="secondary-text">Submissions closed</div>
      </div>
    );
  } else {
    Content = (
      <div className="content">
        <div className="primary-text">{activePoll?.question}</div>
        <div className="secondary-text">
          <span>
            Submissions closing in <Time ms={pollMsLeft} />
          </span>
        </div>
      </div>
    );
  }

  const showPredictionPage = () => {
    setIsOpen();
    pushPage(<PredictionPage />);
  };

  useListenForOpenPrediction(showPredictionPage);

  if (!activePoll) return <></>;

  return (
    <Tile
      className="c-prediction-tile"
      icon={CRYSTAL_BALL_ICON}
      iconViewBox={CRYSTAL_BALL_ICON_VIEWBOX}
      headerText="Prediction"
      color="#AB8FE9"
      onClick={() => pushPage(<PredictionPage />)}
      content={() => Content}
    />
  );
}
