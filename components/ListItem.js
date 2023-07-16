import styles from '../styles/ListItem.module.css'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSWRConfig } from 'swr'
import { API_ENDPOINTS } from '../utils/routes'
import categories from '../utils/categories'
import { PacmanLoader } from 'react-spinners'
import { GridLoader } from 'react-spinners'

function ListItem(props) {
  const { mutate } = useSWRConfig()
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [checkboxLoading, setCheckboxLoading] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(props.completed)

  useEffect(() => {
    setExpanded(false) // Reset expanded to false when title changes during sort
  }, [props.title])

  const handleExpand = () => {
    setExpanded(!expanded)
  }

  let categoryColor = ''
  let labelColor = ''
  const date = new Date(props.date)

  switch (props.category) {
    case categories.LEISURE:
      categoryColor = styles.categoryLeisure
      labelColor = styles.labelLeisure
      break
    case categories.WORK:
      categoryColor = styles.categoryWork
      labelColor = styles.labelWork
      break
    case categories.FITNESS:
      categoryColor = styles.categoryFitness
      labelColor = styles.labelFitness
      break
    default:
      categoryColor = styles.categoryNone
      break
  }

  const handleCheckboxClick = async (e) => {
    e.stopPropagation()
    setCheckboxLoading(true)
    console.log('Checkbox clicked')
    try {
      const response = await fetch(`/api/todos/${props.todoid}/completed`, {
        method: 'PATCH',
      })
      if (response.ok) {
        const url = props.listURL
          ? props.listURL
          : API_ENDPOINTS.GET_TODOS_WITH_LABELS // by default will grab all todos
        await mutate(url)
        console.log('Successfully updated completion status')
      } else {
        console.log('Failed to update completion status')
      }
    } catch (error) {
      console.log('Error occurred while updating completion status:', error)
    }
    setCheckboxLoading(false)
    setCheckboxChecked(!checkboxChecked)
  }

  return (
    <motion.div
      animate={{
        position: 'relative',
        left: 0,
        opacity: 1,
      }}
      initial={{
        position: 'relative',
        left: '-100px',
        opacity: 0,
      }}
    >
      <div className={`${styles.itemContainer} ${categoryColor}`}>
        <div className={styles.unexpandedContainer} onClick={handleExpand}>
          {checkboxLoading ? ( // Render spinner when checkboxLoading is true
            <div className={styles.checkboxSpinner}>
              <GridLoader size={3} color="blue" />
            </div>
          ) : (
            <input
              type="checkbox"
              className={styles.checkbox}
              defaultChecked={checkboxChecked}
              onChange={handleCheckboxClick}
            />
          )}
          <div className={`${styles.label} ${labelColor}`}>
            <p className={styles.pEdit}>{props.label}</p>
          </div>
          <p className={styles.listItem}>{props.title}</p>
          <p
            className={`${styles.pEdit} ${
              props.overdue ? styles.overdueDate : ''
            }`}
          >
            {date.toLocaleDateString('en-GB')}
          </p>
          <div className={styles.favicons}>
            <i className={`fa ${expanded ? 'fa-caret-up' : 'fa-caret-down'}`} />
          </div>
        </div>
        {expanded && (
          <div className={styles.expandedContainer}>
            <p className={styles.description}>{props.description}</p>
            <div className={styles.todoBottomBarWrapper}>
              <p className={`${styles.pEdit} ${styles.duration}`}>
                {props.duration}
              </p>
              <div className={styles.favicons}>
                {deleting ? (
                  <div className={styles.deleting}>
                    <PacmanLoader size={12} color="red" />
                  </div>
                ) : (
                  <div>
                    <i className={`${styles.editIcon} fa fa-edit`}></i>
                    <i
                      className={`${styles.trashIcon} fa fa-trash`}
                      onClick={() =>
                        deleteTodo(
                          props.todoid,
                          mutate,
                          props.listURL,
                          setDeleting,
                          setExpanded
                        )
                      }
                    ></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

async function deleteTodo(todoid, mutate, listURL, setDeleting, setExpanded) {
  setDeleting(true)
  try {
    await fetch('/api/todos/' + todoid, {
      method: 'DELETE',
    })
  } catch (e) {
    console.log(e)
  }
  const url = listURL ? listURL : API_ENDPOINTS.GET_TODOS_WITH_LABELS // by default will grab all todos
  await mutate(url)
  setDeleting(false)
  setExpanded(false)
}

export default ListItem
