import React from 'react';
import { NavigationBar } from '@pluginwoman/t-ds';
import { Trash, Watch } from '@pluginwoman/t-ds/icons/24/Stroked';
import { QuickActionsBar } from '../PaymentRow';
import { Task, TasksState, visibleTasks } from '../../tasks';

interface TasksPageProps {
  state: TasksState;
  onStateChange: (next: TasksState) => void;
  /** Критичная задача включена в настройках прототипа */
  hasCritical: boolean;
  onBack: () => void;
}

const GROUPS: { id: 'urgent' | 'today' | 'week' | 'next'; title: string }[] = [
  { id: 'urgent', title: 'Срочное' },
  { id: 'today', title: 'Сегодня' },
  { id: 'week', title: 'На этой неделе' },
  { id: 'next', title: 'На следующей неделе' },
];

/** Карточка задачи: критичная — красная без действий, обычная — фиолетовая, при наведении «Отложить» и «Удалить» */
const TaskItem: React.FC<{ task: Task; isPostponed: boolean; onPostpone: () => void; onDelete: () => void }> = ({
  task,
  isPostponed,
  onPostpone,
  onDelete,
}) => (
  <div
    role="button"
    tabIndex={0}
    className={['task-card', task.isImportant ? 'task-card--important' : 'task-card--default'].join(' ')}
  >
    <span className="ts-500-xs task-card__category">{task.category}</span>
    <span className="ts-600-s">{task.title}</span>
    <span className="ts-400-xs">{task.text}</span>
    {!task.isImportant && (
      <QuickActionsBar
        actions={[
          ...(isPostponed
            ? []
            : [{ tooltip: 'Отложить', label: `Отложить задачу «${task.title}» на следующую неделю`, icon: <Watch />, onClick: onPostpone }]),
          { tooltip: 'Удалить', label: `Удалить задачу «${task.title}»`, icon: <Trash />, onClick: onDelete },
        ]}
      />
    )}
  </div>
);

/** Экран «Задачи» (макет 300:257342): срочное, сегодня, на этой неделе; отложенные — на следующей неделе */
export const TasksPage: React.FC<TasksPageProps> = ({ state, onStateChange, hasCritical, onBack }) => {
  const tasks = visibleTasks(state, hasCritical);
  const groupOf = (task: Task) => (state.postponed.includes(task.id) ? 'next' : task.group);
  const groups = GROUPS.map((g) => ({ ...g, tasks: tasks.filter((t) => groupOf(t) === g.id) }))
    .filter((g) => g.tasks.length > 0);

  const postpone = (id: string) => onStateChange({ ...state, postponed: [...state.postponed, id] });
  const remove = (id: string) =>
    onStateChange({ deleted: [...state.deleted, id], postponed: state.postponed.filter((p) => p !== id) });

  return (
    <div className="payment-page tasks-page">
      <aside className="payment-page__nav">
        <NavigationBar hasBackButton hasActionButton={false} onBackClick={onBack} backButtonLabel="Назад" title="Задачи" />
      </aside>

      <div className="payment-page__content">
        <div className="payment-page__form">
          {groups.map((group) => (
            <section key={group.id} className="tasks-page__group">
              <h2 className="ts-600-xl">{group.title}</h2>
              {group.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isPostponed={state.postponed.includes(task.id)}
                  onPostpone={() => postpone(task.id)}
                  onDelete={() => remove(task.id)}
                />
              ))}
            </section>
          ))}

          {groups.length === 0 && (
            <p className="ts-400-m tasks-page__empty">Все задачи выполнены</p>
          )}
        </div>
      </div>
    </div>
  );
};
