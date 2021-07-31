import React, { useRef, useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import LikePost from "../components/LikePost";
import SavePost from "../components/SavePost";
import Comment from "../components/Comment";
import Placeholder from "../components/Placeholder";
import Avatar from "../styles/Avatar";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { ModalContent } from "../components/Post";
import useInput from "../hooks/useInput";
import { client } from "../utils";
import { timeSince } from "../utils";
import { MoreIcon, CommentIcon, InboxIcon } from "../components/Icons";
import { RoundNumber } from "../components/RoundNumber";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 60% 1fr;

  .post-info {
    border: 1px solid ${(props) => props.theme.borderColor};
  }

  .post-header-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid ${(props) => props.theme.borderColor};
  }

  .post-header {
    display: flex;
    align-items: center;
  }

  .post-image-wrapper {
		display: flex;
		align-items: center;
  }

  .left-button {
    background:url('/angle-left.png');
    height: 30px;
    width: 30px;
    position: absolute;
    margin-left: 5px;
    border: none;
    opacity: 70%;
  }

  .right-button {
    background:url('/angle-right.png');
    height: 30px;
    width: 30px;
    position: absolute;
    margin-left: -35px;
    border: none;
    opacity: 70%;
  }

  .post-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .post-actions-stats {
    padding: 1rem;
    padding-bottom: 0.1rem;
  }

  .post-actions {
    display: flex;
    align-items: center;
    padding-bottom: 0.5rem;
  }

  .post-actions svg:last-child {
    margin-left: auto;
  }

  .comments {
    border-bottom: 1px solid ${(props) => props.theme.borderColor};
    padding: 1rem;
    height: 300px;
    overflow-y: scroll;
    scrollbar-width: none;
  }

  .comments::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  svg {
    margin-right: 1rem;
  }

  textarea {
    height: 100%;
    width: 100%;
    background: ${(props) => props.theme.bg};
    border: none;
    border-top: 1px solid ${(props) => props.theme.borderColor};
    resize: none;
    padding: 1rem 0 0 1rem;
    font-size: 1rem;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  }

  @media screen and (max-width: 840px) {
    display: flex;
    flex-direction: column;

    .comments {
      height: 100%;
    }
  }
`;

const DetailedPost = () => {
  const history = useHistory();
  const { postId } = useParams();

  const comment = useInput("");
  const commmentsEndRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const closeModal = () => setShowModal(false);

  const [loading, setLoading] = useState(true);
  const [deadend, setDeadend] = useState(false);
  const [post, setPost] = useState({});

  const [likesState, setLikes] = useState(0);
  const [commentsState, setComments] = useState([]);

  //post
  const [postLength, setPostLength] = useState(0);
  const [hasLeft, setHasLeft] = useState(false);
  const [hasRight, setHasRight] = useState(false);
  const [imgId, setImgId] = useState(0);

  const incLikes = () => setLikes(likesState + 1);
  const decLikes = () => setLikes(likesState - 1);

  const scrollToBottom = () =>
    commmentsEndRef.current.scrollIntoView({ behaviour: "smooth" });

  const handleAddComment = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();

      client(`/posts/${post._id}/comments`, {
        body: { text: comment.value },
      }).then((resp) => {
        setComments([...commentsState, resp.data]);
        scrollToBottom();
      });

      comment.setValue("");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    client(`/posts/${postId}`)
      .then((res) => {
        setPost(res.data);
        var length = res.data.files.length;
        setPostLength(length);
        if (length > 1) {
          setHasRight(true);
        }
        setComments(res.data.comments);
        setLikes(res.data.likesCount);
        setLoading(false);
        setDeadend(false);
      })
      .catch((err) => setDeadend(true));
  }, [postId]);

  const setButtonStates = (tempId) => {
    if (tempId == 0) {
      setHasLeft(false);
    } else {
      setHasLeft(true);
    }
    if (tempId < postLength - 1 && postLength > 1) {
      setHasRight(true);
    } else {
      setHasRight(false);
    }
  };

  const clickLeftButton = () => {
    let tempId = imgId - 1;
    setButtonStates(tempId);
    setImgId(tempId);
  };

  const clickRightButton = () => {
    let tempId = imgId + 1;
    setButtonStates(tempId);
    setImgId(tempId);
  };

  if (!deadend && loading) {
    return <Loader />;
  }

  if (deadend) {
    return (
      <Placeholder
        title="Sorry, this page isn't available"
        text="The link you followed may be broken, or the page may have been removed"
      />
    );
  }

  return (
    <Wrapper>
      <div className = "post-image-wrapper">
         <div>
          {hasLeft && (<button className = "left-button" onClick={clickLeftButton}/>)}
          </div>
          <div>
          <img
            className="post-img"
            src={post.files[imgId]}
            alt="post-img"
          />
          </div>
          <div>
          {hasRight && (<button className = "right-button" onClick={clickRightButton}/>)}
          </div>
      </div>

      <div className="post-info">
        <div className="post-header-wrapper">
          <div className="post-header">
            <Avatar
              onClick={() => history.push(`/${post.user?.username}`)}
              className="pointer avatar"
              src={post.user?.avatar}
              alt="avatar"
            />

            <h3
              className="pointer"
              onClick={() => history.push(`/${post.user?.username}`)}
            >
              {post.user?.username}
            </h3>
          </div>
          {post.isMine && <MoreIcon onClick={() => setShowModal(true)} />}

          {showModal && (
            <Modal>
              <ModalContent
                postId={post._id}
                hideGotoPost={true}
                closeModal={closeModal}
              />
            </Modal>
          )}
        </div>

        <div className="comments">
          {commentsState.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))}
          <div ref={commmentsEndRef} />
        </div>

        <div className="post-actions-stats">
          <div className="post-actions">
            <LikePost
              isLiked={post?.isLiked}
              postId={post?._id}
              incLikes={incLikes}
              decLikes={decLikes}
            />
            <CommentIcon />
            <InboxIcon />
            <SavePost isSaved={post?.isSaved} postId={post?._id} />
          </div>

          {likesState !== 0 && (
            <span className="likes bold">
              {RoundNumber(likesState)} {likesState > 1 ? "likes" : "like"}
            </span>
          )}
        </div>

        <span
          style={{ display: "block", padding: "0 1rem", paddingBottom: "1rem" }}
          className="secondary"
        >
          {timeSince(post.createdAt)} ago
        </span>

        <div className="add-comment">
          <textarea
            columns="2"
            placeholder="Add a Comment..."
            value={comment.value}
            onChange={comment.onChange}
            onKeyDown={handleAddComment}
          ></textarea>
        </div>
      </div>
    </Wrapper>
  );
};

export default DetailedPost;
