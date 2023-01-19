// ==UserScript==
// @name         GitHub hide comment PR
// @namespace    http://github.com
// @version      1.0.0
// @description  Add a button to minimise comments on GitHub PRs
// @author       Josh Paveley
// @match        https://github.com/*/pull/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const svgNameSpace = "http://www.w3.org/2000/svg"
    const hideSvgPath = 'M10.896 2H8.75V.75a.75.75 0 00-1.5 0V2H5.104a.25.25 0 00-.177.427l2.896 2.896a.25.25 0 00.354 0l2.896-2.896A.25.25 0 0010.896 2zM8.75 15.25a.75.75 0 01-1.5 0V14H5.104a.25.25 0 01-.177-.427l2.896-2.896a.25.25 0 01.354 0l2.896 2.896a.25.25 0 01-.177.427H8.75v1.25zm-6.5-6.5a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM6 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 016 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5zM12 8a.75.75 0 01-.75.75h-.5a.75.75 0 010-1.5h.5A.75.75 0 0112 8zm2.25.75a.75.75 0 000-1.5h-.5a.75.75 0 000 1.5h.5z'

    // GitHub classes
    const ghSvgClasses = ['octicon', 'octicon-unfold', 'mr-1']
    const ghSpanClasses = ['btn-link', 'color-fg-muted', 'f6']

    const css = `
.comment-line-number--hidden::before {
    content: ''
}
.comment-line-number--expanded img {
    display: none !important;
}

.comment-container--hidden .comment-holder {
    display: none;
}

.comment-container--hidden {
    padding: 0px !important;
}
`;

    function toggleClasses(node, toAdd, toRemove) {
        node.classList.add(toAdd)
        node.classList.remove(toRemove)
    }

    function injectCss(css) {
        const styleNode = document.createElement('style');
        styleNode.type = 'text/css';
        styleNode.textContent = css;
        document.head.appendChild(styleNode);
    }

    function createSvgNode(svgPath) {

        const pathNode = document.createElementNS(svgNameSpace, 'path')
        pathNode.setAttribute('d', svgPath)

        const svg = document.createElementNS(svgNameSpace, 'svg')
        svg.appendChild(pathNode);
        svg.setAttribute('aria-hidden', 'true')
        svg.setAttribute('height', '16')
        svg.setAttribute('width', '16')
        svg.setAttribute('height', '16')
        svg.setAttribute('viewBox', '0 0 16 16')

        // Add our custom backup class
        svg.classList.add('toggle-comment__icon')

        // Add the classes that Github would use
        svg.classList.add(...ghSvgClasses)

        return svg
    }

    function createHideCommentNode() {
        const spanNode = document.createElement('span')

        const svgNode = createSvgNode(hideSvgPath)

        const textNode = document.createTextNode('Hide')

        spanNode.appendChild(svgNode)
        spanNode.appendChild(textNode)

        // Add our custom backup class
        spanNode.classList.add('toggle-comment__span')

        // Add the classes that Github would use
        spanNode.classList.add(...ghSpanClasses)

        return spanNode
    }

    const getAllComments = () => document.getElementsByClassName('comment-holder')

    const getRootLevelActions = comment => comment.getElementsByClassName('timeline-comment-actions')[0]

    const getCommentRow = comment => comment.parentElement.parentElement.previousElementSibling

    const isLhs = comment => {

        const commentHolderNode = comment.parentElement

        const commentRowNodes = Array.from(commentHolderNode.parentElement.children)
        const commentNodeIndex = commentRowNodes.indexOf(commentHolderNode)

        return commentNodeIndex < (commentRowNodes.length / 2)
    }

    const getCommentLineNumberNode = (comment, isLhs) => comment.parentElement.previousElementSibling.children[isLhs ? 0 : 2]

    const getCommentersProfilePicture = (comment) => comment.getElementsByTagName('img')[0].cloneNode(true)

    function isResolved(comment) {
        const commentDetails = comment.getElementsByTagName('details')[0]
        return commentDetails.getAttribute('data-resolved') === "true"
    }

    function injectHideButton(comment, hideCommentButton) {
        const actionNode = getRootLevelActions(comment)
        actionNode.appendChild(hideCommentButton)
    }

    function addTogglesToComments() {

        const comments = getAllComments()

        for (let i = 0; i < comments.length; i++) {

            const commentHolderNode = comments[i]

            if (isResolved(commentHolderNode)) {
                continue;
            }

            // The parent of the comment container
            const commentHolderContainer = commentHolderNode.parentElement
            commentHolderContainer.classList.add('comment-container--expanded')

            // The line number the comment is for, by default the comment is expanded
            const commentLineNumberNode = getCommentLineNumberNode(commentHolderContainer, isLhs(commentHolderNode))
            commentLineNumberNode.classList.add('comment-line-number--expanded')



            // The new 'Hide' node to inject
            const hideCommentNode = createHideCommentNode()
            injectHideButton(commentHolderNode, hideCommentNode)
            hideCommentNode.addEventListener("click", e => {
                toggleClasses(commentHolderContainer, 'comment-container--hidden', 'comment-container--expanded')
                toggleClasses(commentLineNumberNode, 'comment-line-number--hidden', 'comment-line-number--expanded')
            });

            // The commenters avatar to inject in (aka expand button)
            const commenterPpNode = getCommentersProfilePicture(commentHolderNode)
            commentLineNumberNode.appendChild(commenterPpNode)
            commenterPpNode.addEventListener("click", e => {
                toggleClasses(commentHolderContainer, 'comment-container--expanded', 'comment-container--hidden')
                toggleClasses(commentLineNumberNode, 'comment-line-number--expanded', 'comment-line-number--hidden')
            });

        }

    }

    // Code to run here
    injectCss(css)
    addTogglesToComments()


})();