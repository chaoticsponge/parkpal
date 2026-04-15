import { CSSProperties, FC } from 'react';
import { FaTwitter } from 'react-icons/fa';
import { FaSquarePlus } from "react-icons/fa6";
import { AiFillCloseSquare } from "react-icons/ai";
import { FaSortDown } from "react-icons/fa6";

const IconsIndex = {
  twitter: FaTwitter,
  add: FaSquarePlus,
  close: AiFillCloseSquare,
  down: FaSortDown,
};

const Index = {
  ...IconsIndex,
}

export type IconName = keyof typeof Index | "none";

type Props = {
  icon: IconName
  className?: string
  style?: CSSProperties
  onClick?: () => void;
}

export const Icon: FC<Props> = ({ icon, className, style, onClick }) => {
  if (icon == "none") {
    return null;
  }

  const Icon = Index[icon];
  return (
    <Icon className={className} style={style} onClick={onClick} />
  )
}
