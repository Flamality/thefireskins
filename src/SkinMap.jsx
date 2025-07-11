import React from "react";
import { useParams } from "react-router-dom";
export default function SkinMap() {
  const { username } = useParams();
  const skinURL = `https://minotar.net/skin/${username}`;
  return <img src={skinURL} alt={`${username}'s skin`} />;
}
