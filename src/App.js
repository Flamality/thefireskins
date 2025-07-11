import { useEffect, useRef, useState } from "react";
import "./App.css";
import { SkinViewer } from "skinview3d";
import { BiDownload, BiSave } from "react-icons/bi";
import fireskins from "./images/fireskins.png";
import { SiCashapp } from "react-icons/si";
import { BsSave, BsSave2, BsSaveFill } from "react-icons/bs";
import { FaDownload, FaSave, FaTrash } from "react-icons/fa";

function App() {
  const [username, setUsername] = useState("");
  const [current, setCurrent] = useState("steve");
  const [status, setStatus] = useState("No skin loaded yet.");
  const [statusType, setStatusType] = useState("neutral");
  const [saves, setSaves] = useState(["flamality", "TheFireGODX"]);
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);

  const getSkin = async (s) => {
    const regex = /^[a-zA-Z0-9_]+$/;
    let trimmed = username.trim();
    console.log(typeof s);
    if (typeof s == "string") {
      trimmed = s;
    }
    if (trimmed === "" || !regex.test(trimmed)) {
      setStatus("Invalid username!");
      setStatusType("error");
      return;
    }

    setStatus(`Loading ${trimmed}...`);
    setStatusType("loading");

    const minTime = new Promise((resolve) => setTimeout(resolve, 600));
    const skinUrl = `https://minotar.net/skin/${trimmed}`;

    const imageLoaded = new Promise((resolve) => {
      const img = new Image();
      img.src = skinUrl;
      img.onload = resolve;
      img.onerror = resolve;
    });

    await Promise.all([minTime, imageLoaded]);

    setCurrent(trimmed.toLowerCase());

    if (!viewerInstance.current) {
      viewerInstance.current = new SkinViewer({
        canvas: viewerRef.current,
        width: 300,
        height: 400,
        skin: skinUrl,
      });
      const animate = () => {
        if (viewerInstance.current) {
          viewerInstance.current.camera.rotation.y += 0.5;
          requestAnimationFrame(animate);
        }
      };
      animate();
    } else {
      viewerInstance.current.loadSkin(skinUrl);
    }

    if (viewerInstance.current) {
      viewerInstance.current.camera.rotation.x = 0;
      viewerInstance.current.camera.rotation.y = 0;
      viewerInstance.current.camera.rotation.z = 0;
      viewerInstance.current.zoom = 0.7;
    }

    setStatus(`Showing ${trimmed}'s skin!`);
    setStatusType("success");
  };

  const download = async () => {
    if (!current) {
      setStatus("Nothing to download!");
      setStatusType("error");
      return;
    }

    try {
      setStatusType("loading");
      setStatus("Downloading skin...");
      const response = await fetch(`https://minotar.net/skin/${current}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${current}_skin.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      setStatus("Download complete!");
      setStatusType("success");
    } catch (err) {
      console.error("Download failed:", err);
      setStatus("Download failed!");
      setStatusType("error");
    }
  };

  const save = () => {
    if (!current || current === "steve") return;
    let updated = [...saves];
    if (!updated.includes(current)) updated.splice(0, 0, current);
    setSaves(updated);
    localStorage.setItem("savedSkins", JSON.stringify(updated));
  };
  const removeSave = (s) => {
    let updated = saves.filter((skin) => skin !== s);
    setSaves(updated);
    localStorage.setItem("savedSkins", JSON.stringify(updated));
  };
  useEffect(() => {
    viewerInstance.current = new SkinViewer({
      canvas: viewerRef.current,
      width: 300,
      height: 400,
      skin: `https://minotar.net/skin/Steve`,
    });
    const animate = () => {
      if (viewerInstance.current) {
        viewerInstance.current.camera.rotation.y += 0.5;
        requestAnimationFrame(animate);
      }
    };
    animate();
    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedSkins"));
    if (saved && Array.isArray(saved)) setSaves(saved);
  }, []);

  return (
    <div className='App'>
      <div className='top-banner'>
        <img className='logo' src={fireskins} alt='fireskins logo' />
      </div>
      <div className='top'>
        <input
          type='text'
          value={username}
          placeholder='Enter Username'
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              getSkin();
            }
          }}
        />
        <button onClick={getSkin}>Get Skin</button>
      </div>

      <p className={`status ${statusType}`}>{status}</p>

      <div className='middle'>
        <div className='skin-viewer'>
          <canvas
            ref={viewerRef}
            className={`${statusType == "loading" ? "canvas-hide" : ""}`}
            style={
              statusType == "loading"
                ? {
                    height: 0,
                    width: 0,
                  }
                : {
                    width: 300,
                    height: 400,
                  }
            }
          ></canvas>
          <p
            className={`skin-name ${
              statusType == "loading" ? "skin-name-hide" : ""
            }`}
          >
            {current || "steve"}
          </p>
        </div>

        <div className='user-info'>
          <div>
            <p>Username</p>
            <p>{current || "N/A"}</p>
          </div>
          <div>
            <p>Skin Link</p>
            <p>{current ? `https://thefire.skin/u/${current}` : "N/A"}</p>
          </div>
        </div>

        <div className='buttons'>
          <button onClick={download} className='download-btn'>
            <FaDownload /> Download Skin
          </button>
          <button onClick={save} className='save-btn'>
            <FaSave />
          </button>
        </div>
      </div>

      <div className='bottom'>
        {saves.length > 0 && (
          <div className='save-section'>
            <p>My Saved Users</p>
            <div className='saves-strip'>
              {saves.map((s, i) => (
                <div
                  key={i}
                  className='save-item'
                  onClick={() => {
                    getSkin(s);
                  }}
                >
                  <p>{s}</p>
                  <img src={`https://minotar.net/body/${s}/100.png`} />
                  <button
                    className='remove-save'
                    onClick={() => {
                      removeSave(s);
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className='support-banner'>
          <p>🔥 Support this project 🔥</p>
          <a href='https://cash.app/$Smaranj' target='__blank'>
            <SiCashapp /> Cashapp
          </a>
        </div>
        <div className='footer-badge'>
          <a href='https://flamality.com' target='_blank' rel='noreferrer'>
            Made by Flamality
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
