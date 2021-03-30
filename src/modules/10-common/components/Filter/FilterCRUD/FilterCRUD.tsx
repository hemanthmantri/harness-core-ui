import React, { useState, useEffect, ReactElement } from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import { isEmpty, omitBy, truncate } from 'lodash-es'
import {
  Button,
  Color,
  Formik,
  FormInput,
  Icon,
  Layout,
  FormikForm,
  Label,
  Popover,
  useModalHook,
  OverlaySpinner
} from '@wings-software/uicore'
import type { FormikProps, FormikErrors } from 'formik'
import { Menu, Classes, Position, PopoverInteractionKind, Dialog, IDialogProps } from '@blueprintjs/core'
import { useToaster } from '@common/components/Toaster/useToaster'
import { useStrings } from 'framework/exports'
import { StringUtils } from '@common/exports'
import { UNIQUE_ID_MAX_LENGTH } from '@common/utils/StringUtils'
import type { FilterInterface } from '../Constants'

import css from './FilterCRUD.module.scss'

export type CrudOperation = 'ADD' | 'UPDATE' | 'DELETE'

interface FilterCRUDProps<T> extends Partial<Omit<FormikProps<T>, 'initialValues'>> {
  filters?: T[]
  initialValues: FormikProps<T>['initialValues']
  onSaveOrUpdate: (isUpdate: boolean, data: T) => Promise<void>
  onDelete: (identifier: string) => Promise<void>
  onClose: () => void
  onFilterSelect: (identifier: string) => void
  enableEdit?: boolean
  isRefreshingFilters: boolean
  dataSvcConfig?: Map<CrudOperation, Function>
  ref?: FilterCRUDFowardRef<T>
  onSuccessfulCrudOperation?: () => Promise<void>
}

const FILTER_LIST_MAX_HEIGHT = 85
const EDIT_SECTION_HEIGHT = 30
const STEP_SIZE = 1.5
const MAX_FILTER_NAME_LENGTH = 20

export interface FilterCRUDRef<T> {
  saveOrUpdateFilterHandler: (isUpdate: boolean, payload: T) => Promise<T | undefined>
  deleteFilterHandler: (identifier: string) => Promise<void>
  duplicateFilterHandler: (identifier: string) => Promise<void>
}

export type FilterCRUDFowardRef<T> =
  | ((instance: FilterCRUDRef<T> | null) => void)
  | React.MutableRefObject<FilterCRUDRef<T> | null>
  | null

const FilterCRUDRef = <T extends FilterInterface>(props: FilterCRUDProps<T>, filterCRUDRef: FilterCRUDFowardRef<T>) => {
  const {
    filters,
    initialValues,
    onSaveOrUpdate,
    onClose,
    onDelete,
    onFilterSelect,
    enableEdit,
    isRefreshingFilters,
    dataSvcConfig,
    onSuccessfulCrudOperation
  } = props

  const [isEditEnabled, setIsEditEnabled] = useState<boolean>()
  const [isNewFilter, setIsNewFilter] = useState<boolean>(false)
  const [filterInContext, setFilterInContext] = useState<T | null>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const ignoreClickEventDefaultBehaviour = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault()
    event.stopPropagation()
  }

  const onAddNewFilter = (event: React.MouseEvent<Element, MouseEvent>): void => {
    ignoreClickEventDefaultBehaviour(event)
    setIsEditEnabled(true)
    setIsNewFilter(true)
    setFilterInContext(null)
  }

  useEffect(() => {
    setIsEditEnabled(enableEdit)
  }, [enableEdit])

  const formHasInitialValues = (): boolean => isEmpty(omitBy(initialValues, isEmpty))

  useEffect(() => {
    if (!isNewFilter) {
      setFilterInContext(initialValues)
    }
  }, [isNewFilter, initialValues])

  useEffect(() => {
    if (filterInContext?.identifier) {
      onFilterSelect(filterInContext?.identifier || '')
    }
  }, [filterInContext?.identifier])

  const getFilterByIdentifier = (identifier: string): T | undefined =>
    filters?.find((filter: T) => filter.identifier?.toLowerCase() === identifier.toLowerCase())

  const handleSaveOrUpdate = async (isUpdate: boolean, payload: T): Promise<T | undefined> => {
    try {
      if (isUpdate) {
        const { status, data: updatedFilter } = await dataSvcConfig?.get('UPDATE')?.(payload)
        if (status === 'SUCCESS') {
          showSuccess(`${payload?.name} updated.`)
          return updatedFilter
        }
      } else {
        const { status } = await dataSvcConfig?.get('ADD')?.(payload)
        if (status === 'SUCCESS') {
          showSuccess(`${payload?.name} saved.`)
        }
      }
    } /* istanbul ignore next */ catch (e) {
      showError(e.data?.message || e.message)
    }
  }

  const handleDelete = async (identifier: string): Promise<void> => {
    const matchingFilter = getFilterByIdentifier(identifier)
    if (!matchingFilter?.identifier) {
      showError(getString('somethingWentWrong'))
      return
    }
    try {
      const { status, data } = await dataSvcConfig?.get('DELETE')?.(matchingFilter?.identifier || '')
      if (status === 'SUCCESS' && data) {
        showSuccess(`${matchingFilter?.name} ${getString('filters.filterDeleted')}`)
      } else {
        showError(getString('somethingWentWrong'))
      }
    } /* istanbul ignore next */ catch (e) {
      showError(e.data?.message || e.message)
    }
  }

  const handleDuplicate = async (identifier: string): Promise<void> => {
    setIsLoading(true)
    const matchingFilter = getFilterByIdentifier(identifier)
    const {
      name: _name,
      filterVisibility: _filterVisibility,
      filterProperties,
      projectIdentifier,
      orgIdentifier
    } = matchingFilter as T
    const uniqueId = new Date().getTime().toString()
    const duplicatedFilterName = (_name.concat(uniqueId) || '').substring(0, UNIQUE_ID_MAX_LENGTH)
    const payload = {
      name: duplicatedFilterName,
      identifier: StringUtils.getIdentifierFromName(duplicatedFilterName)
        .concat(uniqueId)
        .substring(0, UNIQUE_ID_MAX_LENGTH),
      projectIdentifier,
      orgIdentifier,
      filterVisibility: _filterVisibility,
      filterProperties
    }
    try {
      const { status } = await dataSvcConfig?.get('ADD')?.(payload)
      if (status === 'SUCCESS') {
        showSuccess(`${payload?.name} duplicated.`)
        await onSuccessfulCrudOperation?.()
      }
    } /* istanbul ignore next */ catch (e) {
      showError(e.data?.message || e.message)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (!filterCRUDRef) return

    if (typeof filterCRUDRef === 'function') {
      return
    }

    filterCRUDRef.current = {
      deleteFilterHandler: handleDelete,
      saveOrUpdateFilterHandler: handleSaveOrUpdate,
      duplicateFilterHandler: handleDuplicate
    }
  })

  const confirmDialogProps: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: true,
    style: { width: 500, height: 200 }
  }

  const [showModal, hideModal] = useModalHook(() => {
    const { filterVisibility, identifier } = filterInContext as T
    return (
      <Dialog
        title={getString('filters.confirmDelete')}
        icon="warning-sign"
        {...confirmDialogProps}
        onClose={hideModal}
      >
        <div className={Classes.DIALOG_BODY}>
          {filterVisibility === 'OnlyCreator'
            ? getString('filters.deleteFilterForUser')
            : getString('filters.deleteFilterForEveryone')}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <Button
            intent="primary"
            text={getString('confirm')}
            onClick={() => {
              if (identifier) {
                onDelete(identifier).then(_res => {
                  setIsEditEnabled(false)
                })
              }
              hideModal()
            }}
          />
          &nbsp; &nbsp;
          <Button text={getString('cancel')} onClick={hideModal} />
        </div>
      </Dialog>
    )
  }, [filterInContext])

  const renderOptionMenu = (filter: T): JSX.Element => {
    return (
      <Popover interactionKind={PopoverInteractionKind.HOVER} className={Classes.DARK} position={Position.RIGHT_TOP}>
        <Button
          id={`filtermenu-${filter?.identifier}`}
          minimal
          icon="Options"
          onClick={e => {
            e.stopPropagation()
          }}
        />
        <Menu>
          <Menu.Item
            icon="edit"
            text={getString('edit')}
            className={css.menuItem}
            onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
              ignoreClickEventDefaultBehaviour(event)
              setFilterInContext(filter)
              setIsEditEnabled(true)
              setIsNewFilter(false)
            }}
            disabled={isEditEnabled && filter?.identifier === filterInContext?.identifier}
          />
          <Menu.Item
            icon="duplicate"
            text={getString('duplicate')}
            className={css.menuItem}
            onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
              ignoreClickEventDefaultBehaviour(event)
              handleDuplicate(filter.identifier).then(_res => {
                setIsEditEnabled(false)
              })
            }}
          />
          <Menu.Item
            icon="trash"
            text={getString('delete')}
            className={css.menuItem}
            onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
              ignoreClickEventDefaultBehaviour(event)
              showModal()
              setFilterInContext(filter)
            }}
          />
        </Menu>
      </Popover>
    )
  }

  const renderFilter = (filter: T): JSX.Element => {
    const { name, filterVisibility, identifier } = filter
    return (
      <Layout.Horizontal
        flex
        spacing="small"
        padding={{ right: 'medium' }}
        className={cx(css.filter, { [css.isActive]: identifier === filterInContext?.identifier })}
        key={identifier}
        onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          ignoreClickEventDefaultBehaviour(event)
          onFilterSelect(identifier)
        }}
        title={filterVisibility === 'OnlyCreator' ? getString('filters.visibilityTitle') : ''}
      >
        <Layout.Horizontal spacing="small" padding="medium">
          {filterVisibility === 'OnlyCreator' ? (
            <Icon name="lock" margin={{ left: 'xsmall' }} />
          ) : (
            <span className={css.noElement} />
          )}
          <div className={css.filterLabel} title={name}>
            {truncate(name, { length: MAX_FILTER_NAME_LENGTH })}
          </div>
        </Layout.Horizontal>
        {renderOptionMenu(filter)}
      </Layout.Horizontal>
    )
  }

  const getFilterListHeight = (submitCount: number, errorCount: number): number => {
    if (isEditEnabled) {
      return FILTER_LIST_MAX_HEIGHT - EDIT_SECTION_HEIGHT - (submitCount > 0 ? STEP_SIZE * errorCount : 0)
    }
    return FILTER_LIST_MAX_HEIGHT
  }

  const renderFilterList = (
    submitCount: number,
    errors: FormikErrors<{
      name: string
      filterVisibility?: T['filterVisibility']
    }>
  ): JSX.Element => {
    return (
      <ol
        className={cx(css.filters)}
        style={{
          maxHeight: `${getFilterListHeight(submitCount, Object.keys(errors).length)}vh`
        }}
      >
        {filters?.filter((filter: T) => filter.name).map((filter: T) => renderFilter(filter))}
      </ol>
    )
  }

  const getCRUDOperationLabel = (): string => {
    if (isNewFilter) {
      return getString('save')
    } else if (isEditEnabled) {
      return getString('update')
    }
    return getString('save')
  }

  return (
    <div className={css.main}>
      <Layout.Vertical spacing="large" padding={{ top: 'large', left: 'medium', right: 'small' }}>
        <Layout.Horizontal flex>
          <Layout.Horizontal spacing="small" className={css.layout}>
            <Icon name="ng-filter" size={25} color={Color.WHITE} />
            <span className={css.title}>Filter</span>
          </Layout.Horizontal>
          <Button minimal icon="cross" onClick={onClose} color={Color.WHITE} />
        </Layout.Horizontal>
      </Layout.Vertical>
      {isRefreshingFilters || isLoading ? (
        <OverlaySpinner show={true} className={css.loading}>
          <></>
        </OverlaySpinner>
      ) : (
        <>
          <Layout.Vertical padding={{ top: 'xlarge' }}>
            <Button
              intent="primary"
              icon="plus"
              text={getString('filters.newFilter')}
              className={cx(css.addNewFilterBtn, { [css.isActive]: formHasInitialValues() })}
              onClick={onAddNewFilter}
              padding={{ left: 'large' }}
              border={false}
            />
          </Layout.Vertical>
          <Formik
            onSubmit={values => {
              const payload = Object.assign(values, {
                identifier: filterInContext?.identifier
              }) as T
              /* istanbul ignore else */ if (payload?.name && payload?.filterVisibility) {
                onSaveOrUpdate(isNewFilter ? false : true, payload)?.then(_res => {
                  setFilterInContext(payload)
                })
              }
              setIsEditEnabled(false)
            }}
            validationSchema={Yup.object().shape({
              name: Yup.string().trim().required(getString('filters.nameRequired')),
              filterVisibility: Yup.mixed()
                .oneOf(['OnlyCreator', 'EveryOne'])
                .required(getString('filters.visibilityRequired'))
            })}
            initialValues={isNewFilter ? { name: '' } : initialValues}
            enableReinitialize={true}
          >
            {formik => {
              return (
                <FormikForm>
                  {filters && filters.length > 0 ? renderFilterList(formik?.submitCount, formik?.errors) : null}
                  {isEditEnabled ? (
                    <Layout.Vertical spacing="large" padding={{ top: 'xlarge', left: 'large', right: 'large' }}>
                      <FormInput.Text
                        name={'name'}
                        label={
                          <Label
                            style={{ fontSize: 'small', color: Color.WHITE, paddingBottom: 'var(--spacing-small)' }}
                          >
                            {getString('filters.name')}
                          </Label>
                        }
                        className={css.filterName}
                        placeholder={getString('filters.typeFilterName')}
                      />
                      <Layout.Vertical spacing={'medium'} margin={{ top: 'large' }}>
                        <Label style={{ fontSize: 'small', color: Color.WHITE }}>
                          {getString('filters.filterVisibility')}
                        </Label>
                        <FormInput.RadioGroup
                          inline
                          name="filterVisibility"
                          items={[
                            { label: getString('filters.visibileToOnlyMe'), value: 'OnlyCreator' },
                            {
                              label: getString('filters.visibleToEveryone'),
                              value: 'EveryOne'
                            }
                          ]}
                          style={{ display: 'flex', flexDirection: 'column' }}
                          className={css.radioBtns}
                        />
                      </Layout.Vertical>
                      <Layout.Horizontal spacing={'medium'} margin={{ top: 'large' }}>
                        <Button
                          text={getCRUDOperationLabel()}
                          className={css.saveFilterBtn}
                          type="submit"
                          onClick={(event: React.MouseEvent<Element, MouseEvent>) => {
                            ignoreClickEventDefaultBehaviour(event)
                            formik.submitForm()
                          }}
                        />
                        <Button
                          type="reset"
                          intent={'primary'}
                          minimal
                          text={getString('cancel')}
                          className={css.cancelBtn}
                          onClick={(event: React.MouseEvent<Element, MouseEvent>) => {
                            ignoreClickEventDefaultBehaviour(event)
                            if (isEditEnabled) setIsEditEnabled(false)
                            if (isNewFilter) setIsNewFilter(false)
                            setFilterInContext(null)
                          }}
                        />
                      </Layout.Horizontal>
                    </Layout.Vertical>
                  ) : null}
                </FormikForm>
              )
            }}
          </Formik>
        </>
      )}
    </div>
  )
}

export const FilterCRUD = React.forwardRef(FilterCRUDRef) as <T extends FilterInterface>(
  props: FilterCRUDProps<T>,
  ref: FilterCRUDFowardRef<T>
) => ReactElement
