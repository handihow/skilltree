import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

const copyToClipboard = (url) => {
  if (!url) return;
  navigator.clipboard.writeText(url);
  toast.info("Link copied to clipboard!");
};

const openEmailClient = (url) => {
  window.location.href = `mailto:?subject=Link%20to%20my%20skilltree&body=${url}`;
};

export default function OptionsEditor({ composition, handleChange, url, toggleOptionsEditor }) {
  return (
    <div className="m-3">
      <div className="block">
        <div className="level">
          <div className="level-left">
            <div className="title is-6">
              <span className="icon">
                <FontAwesomeIcon icon="cogs"></FontAwesomeIcon>
              </span>
              Settings
            </div>
          </div>
          <div className="level-right">
            <button className="delete" onClick={toggleOptionsEditor}></button>
          </div>
        </div>
        <div className="field is-inline-block-desktop mt-2">
          <div className="field is-narrow">
            <label className="label">Who can view skilltree</label>
            <div className="control">
              {["true", "false"].map((option, index) => (
                <label className="radio" key={index}>
                  <input
                    type="radio"
                    name="loggedInUsersOnly"
                    value={option}
                    checked={
                      composition &&
                      composition.loggedInUsersOnly?.toString() === option
                        ? true
                        : false
                    }
                    onChange={(event) =>
                      handleChange(
                        event.currentTarget.name,
                        event.currentTarget.value === "true" ? true : false
                      )
                    }
                  />
                  <span style={{ marginLeft: "10px" }}>
                    {option === "true"
                      ? "Logged in users"
                      : "No need to log in"}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {composition?.loggedInUsersOnly && (
            <React.Fragment>
              <div className="field is-narrow">
                <label className="label">
                  Logged in users can edit skilltree?
                </label>
                <div className="control">
                  {["true", "false"].map((option, index) => (
                    <label className="radio" key={index}>
                      <input
                        type="radio"
                        name="loggedInUsersCanEdit"
                        value={option}
                        checked={
                          composition &&
                          composition.loggedInUsersCanEdit?.toString() ===
                            option
                            ? true
                            : false
                        }
                        onChange={(event) =>
                          handleChange(
                            event.currentTarget.name,
                            event.currentTarget.value === "true" ? true : false
                          )
                        }
                      />
                      <span style={{ marginLeft: "10px" }}>
                        {option === "true"
                          ? "Logged in users can mark skills as completed"
                          : "Only I can mark skills as completed"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="field is-narrow">
                <label className="label">
                  Logged in users can copy skilltree?
                </label>
                <div className="control">
                  {["true", "false"].map((option, index) => (
                    <label className="radio" key={index}>
                      <input
                        type="radio"
                        name="canCopy"
                        value={option}
                        checked={
                          composition &&
                          composition.canCopy?.toString() === option
                            ? true
                            : false
                        }
                        onChange={(event) =>
                          handleChange(
                            event.currentTarget.name,
                            event.currentTarget.value === "true" ? true : false
                          )
                        }
                      />
                      <span style={{ marginLeft: "10px" }}>
                        {option === "true"
                          ? "Logged in users can copy the skilltree"
                          : "Copying skilltree not allowed"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
      <div className="block">
        <div className="title is-6">
          <span className="icon">
            <FontAwesomeIcon icon="share"></FontAwesomeIcon>
          </span>
          Share link
        </div>
        <div className="title is-7">
          <a href={url || ""} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </div>
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <button
                className="button has-tooltip-multiline"
                onClick={() => copyToClipboard(url)}
                data-tooltip="Copy link to clipboard"
              >
                <span className="icon">
                  <FontAwesomeIcon icon="copy" />
                </span>
                <span>Copy link</span>
              </button>
            </div>
            <div className="level-item">
              <button
                className="button has-tooltip-multiline"
                onClick={() => openEmailClient(url)}
                data-tooltip="Open new email with link"
              >
                <span className="icon">
                  <FontAwesomeIcon icon="envelope" />
                </span>
                <span>Email link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
