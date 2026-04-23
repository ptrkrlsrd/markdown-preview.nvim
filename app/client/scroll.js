let scrollRaf = null

function easeOutCubic (t) {
  const u = 1 - t
  return 1 - u * u * u
}

function scroll (offsetTop) {
  if (scrollRaf !== null) {
    cancelAnimationFrame(scrollRaf)
    scrollRaf = null
  }

  const root = document.documentElement
  const maxY = Math.max(0, root.scrollHeight - window.innerHeight)
  let target = offsetTop
  if (target < 0) {
    target = 0
  }
  if (target > maxY) {
    target = maxY
  }

  const startY = window.scrollY
  if (startY === target) {
    return
  }

  const duration = 400
  const delta = target - startY
  let t0 = null

  function frame (now) {
    if (t0 === null) {
      t0 = now
    }
    let u = (now - t0) / duration
    if (u > 1) {
      u = 1
    }
    const y = startY + delta * easeOutCubic(u)
    window.scrollTo(0, y)
    if (u < 1) {
      scrollRaf = requestAnimationFrame(frame)
      return
    }
    scrollRaf = null
  }

  scrollRaf = requestAnimationFrame(frame)
}

function getAttrTag (line) {
  return `[data-source-line="${line}"]`
}

function getPreLineOffsetTop (line) {
  let currentLine = line - 1
  let ele = null
  while (currentLine > 0 && !ele) {
    ele = document.querySelector(getAttrTag(currentLine))
    if (!ele) {
      currentLine -= 1
    }
  }
  return [
    currentLine >= 0 ? currentLine : 0,
    ele ? ele.offsetTop : 0
  ]
}

function getNextLineOffsetTop (line, len) {
  let currentLine = line + 1
  let ele = null
  while (currentLine < len && !ele) {
    ele = document.querySelector(getAttrTag(currentLine))
    if (!ele) {
      currentLine += 1
    }
  }
  return [
    currentLine < len ? currentLine : len - 1,
    ele ? ele.offsetTop : document.documentElement.scrollHeight
  ]
}

function topOrBottom (line, len) {
  if (line === 0) {
    scroll(0)
  } else if (line === len - 1) {
    scroll(document.documentElement.scrollHeight)
  }
}

function relativeScroll (line, ratio, len) {
  let offsetTop = 0
  const lineEle = document.querySelector(`[data-source-line="${line}"]`)
  if (lineEle) {
    offsetTop = lineEle.offsetTop
  } else {
    const pre = getPreLineOffsetTop(line)
    const next = getNextLineOffsetTop(line, len)
    offsetTop = pre[1] + ((next[1] - pre[1]) * (line - pre[0]) / (next[0] - pre[0]))
  }
  scroll(offsetTop - document.documentElement.clientHeight * ratio)
}

export default {
  relative: function ({
    cursor,
    winline,
    winheight,
    len
  }) {
    const line = cursor - 1
    const ratio = winline / winheight
    if (line === 0 || line === len - 1) {
      topOrBottom(line, len)
    } else {
      relativeScroll(line, ratio, len)
    }
  },
  middle: function ({
    cursor,
    // winline,
    // winheight,
    len
  }) {
    const line = cursor - 1
    if (line === 0 || line === len - 1) {
      topOrBottom(line, len)
    } else {
      relativeScroll(line, 0.5, len)
    }
  },
  top: function ({
    cursor,
    winline,
    // winheight,
    len
  }) {
    let line = cursor - 1
    if (line === 0 || line === len - 1) {
      topOrBottom(line, len)
    } else {
      line = cursor - winline
      relativeScroll(line, 0, len)
    }
  }
}
